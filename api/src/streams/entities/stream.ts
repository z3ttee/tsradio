import { Channel } from "src/channel/entities/channel.entity";
import { StreamQueue } from "./stream-queue";
import { ReadStream, createReadStream, readFileSync } from "node:fs";
import Throttle from "throttle";
import { PassThrough } from "node:stream";
import { isNull, randomString } from "@soundcore/common";
import { ffprobe } from "@dropb/ffprobe";
import { Logger } from "@nestjs/common";
import { BehaviorSubject, Subject, from, switchMap } from "rxjs";
import { Track } from "./track";
import path from "node:path";
import NodeID3 from "node-id3";
import ffprobeStatic from "ffprobe-static";

ffprobe.path = ffprobeStatic.path;

export class Listener {
    public readonly id: string = randomString(32);
    public readonly client: PassThrough = new PassThrough();
}

export class Stream {
    private readonly logger = new Logger(`${Stream.name}-${this.channel.name}`);

    private readonly queue: StreamQueue = new StreamQueue(this.channel);
    private readonly listeners: Map<string, Listener> = new Map();

    private readonly _errorSubject = new Subject<Error>();
    public readonly $error = this._errorSubject.asObservable();

    private stream: ReadStream;
    private throttle: Throttle;

    private readonly _currentFile = new BehaviorSubject<string>(null);
    public readonly $currentTrack = this._currentFile.asObservable().pipe(switchMap((file) => from(this.readID3Tags(file))));

    constructor(public readonly channel: Channel) {}

    /**
     * Create a new listener instance.
     * This will generate an id and a passthrough 
     * object to pipe streams.
     * @returns Listener
     */
    public async createListener(): Promise<Listener> {
        return new Promise<Listener>((resolve) => {
            const listener = new Listener();
            this.listeners.set(listener.id, listener);

            this.logger.log(`Listener connected (${this.listeners.size})`);
            resolve(listener);
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
            this.listeners.delete(id);
            this.logger.log(`Listener disconnected (${this.listeners.size})`);
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
            this._currentFile.next(null);
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
        const next = this.queue.getNext();
        this._currentFile.next(next);
        return this.loadStream(next);
    }

    /**
     * Check if the stream already started streaming
     */
    public get started() {
        return this.stream && this.throttle && this._currentFile.getValue();
    }

    private async startStream() {
        const file = this._currentFile.getValue();
        if (!file) return;

        const bitrate = await this.getTrackBitrate(file);
        this.throttle = new Throttle(bitrate / 8);

        this.stream
            .pipe(this.throttle)
            .on("data", (chunk) => this.broadcast(chunk))
            .on("end", () => this.startNext())
            .on("error", () => this.startNext());
    }

    /**
     * Start the stream if not already streaming
     */
    public async start() {
        if(this.started) return;
        await this.startNext();
    }

    /**
     * Internal method to start playing
     * next track in queue
     */
    private async startNext() {
        await this.next();
        await this.startStream();
    }

    /**
     * Internal method to calculate bitrate from track
     * @param filepath Path to the mp3 file
     * @returns Bitrate in bits/sec
     */
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

    /**
     * Internal method to broadcast a chunk
     * for the stream to all connected clients
     * @param chunk Chunk of data
     */
    private async broadcast(chunk) {
        this.listeners.forEach((listener, id) => {
            const client = listener.client;

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

    private async readID3Tags(file: string): Promise<Track> {
        if(isNull(file)) return null;
        return new Promise<Track>((resolve) => {
            const tags = NodeID3.read(file);

            if(isNull(tags)) {
                resolve(null);
            } else {
                const artists = tags.artist?.split(",") ?? [];

                const track = new Track();
                track.name = tags.title ?? path.basename(file);
                track.primaryArtist = artists.splice(0, 1)?.[0] ?? undefined;
                track.featuredArtists = artists ?? [];
    
                resolve(track);
            }
        }).catch((error: Error) => {
            this.logger.error(`Error whilst reading ID3 tags from file '${file}': ${error.message}`, error);
            return null;
        });
    }
}