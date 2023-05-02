import { Channel } from "src/channel/entities/channel.entity";
import { StreamQueue } from "./stream-queue";
import { ReadStream, createReadStream } from "node:fs";
import Throttle from "throttle";
import { PassThrough } from "node:stream";
import { isNull, randomString } from "@soundcore/common";
import { ffprobe } from "@dropb/ffprobe";
import ffprobeStatic from "ffprobe-static";
import { Logger } from "@nestjs/common";
import { Subject } from "rxjs";

ffprobe.path = ffprobeStatic.path;

export interface Listener {
    id: string;
    client: PassThrough;
}

export class Stream {
    private readonly logger = new Logger(`${Stream.name}-${this.channel.name}`);

    private readonly queue: StreamQueue = new StreamQueue(this.channel);
    private readonly clients: Map<string, PassThrough> = new Map();

    private readonly _errorSubject = new Subject<Error>();
    public readonly $error = this._errorSubject.asObservable();

    private stream: ReadStream;
    private throttle: Throttle;

    private currentFile: string;

    constructor(public readonly channel: Channel) {}

    /**
     * Create a new listener instance.
     * This will generate an id and a passthrough 
     * object to pipe streams.
     * @returns Listener
     */
    public async createListener(): Promise<Listener> {
        return new Promise<Listener>((resolve) => {
            this.logger.log("A listener connected");

            const id = randomString(32);
            const client = new PassThrough();
            this.clients.set(id, client);

            resolve({ 
                id: id, 
                client: client
            });
        }).then((listener) => listener).catch((error: Error) => {
            this.logger.error(`Error while adding client to stream: ${error.message}`, error);
            this._errorSubject.next(error);
            return null;
        });
    }

    /**
     * Remove an existing listener from the stream to
     * end the stream
     * @param id Id of the listener object
     */
    public async removeListener(id: string): Promise<void> {
        return new Promise<void>((resolve) => {
            this.clients.delete(id);
            this.logger.log("A listener got disconnected");
            resolve();
        }).catch((error: Error) => {
            this.logger.error(`Error while removing client from stream: ${error.message}`, error);
            this._errorSubject.next(error);
        });
    }

    /**
     * Skip current track.
     */
    public async skip(): Promise<void> {
        return new Promise<void>((resolve) => {
            this.currentFile = null;
            this.throttle.end();
            this.throttle = null;
            resolve();
        }).catch((error: Error) => {
            this.logger.error(`Error while skipping current track: ${error.message}`, error);
            this._errorSubject.next(error);
            throw error;
        });
    }

    private async next(): Promise<void> {
        this.logger.log("Getting next track from queue");
        const next = this.queue.getNext();
        this.currentFile = next;

        return this.loadStream(next);
    }

    public get started() {
        return this.stream && this.throttle && this.currentFile;
    }

    private async startStream() {
        const file = this.currentFile;
        if (!file) return;

        const bitrate = await this.getTrackBitrate(file);

        if(isNull(this.throttle)) {
            this.throttle = new Throttle(bitrate / 8);
        }

        this.stream
            .pipe(this.throttle)
            .on("data", (chunk) => this.broadcast(chunk))
            .on("end", () => this.start())
            .on("error", () => this.start());
    }

    public async start() {
        if(!isNull(this.currentFile)) return;
        this.logger.log("Starting stream");
        await this.next();
        await this.startStream();
    }

    private async getTrackBitrate(filepath: string) {
        const data = await ffprobe(filepath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    private async loadStream(file: string): Promise<void> {
        return new Promise<void>((resolve) => {
            if (!file) return;
            this.stream = createReadStream(file);
            resolve();
        }).catch((error: Error) => {
            this.logger.error(`Error occured while loading stream for file '${file}': ${error.message}`, error);
            return this.skip();
        });
    }

    private async broadcast(chunk) {
        this.clients.forEach((client, id) => {
            try {
                // Write chunk to client 
                client.write(chunk);
            } catch (err) {
                // Handle exceptions
                if(err instanceof Error) {
                    // End client stream
                    client.end();
                    // Remove listener
                    this.removeListener(id);
                }
            }
        });
    }
}