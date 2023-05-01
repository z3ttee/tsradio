import { Channel } from "src/channel/entities/channel.entity";
import { StreamQueue } from "./stream-queue";
import { ReadStream, createReadStream } from "node:fs";
import Throttle from "throttle";
import { PassThrough } from "node:stream";
import { isNull, randomString } from "@soundcore/common";
import { ffprobe } from "@dropb/ffprobe";
import ffprobeStatic from "ffprobe-static";
import { Logger } from "@nestjs/common";

ffprobe.path = ffprobeStatic.path;

export class Stream {
    private readonly logger = new Logger(`${Stream.name}-${this.channel.name}`);

    private readonly queue: StreamQueue = new StreamQueue(this.channel);
    private readonly clients: Map<string, PassThrough> = new Map();

    private stream: ReadStream;
    private throttle: Throttle;

    private currentFile: string;

    constructor(public readonly channel: Channel) {}

    public addClient() {
        const id = randomString(32);
        const client = new PassThrough();

        this.clients.set(id, client);

        this.logger.log("A listener connected");
        return { id, client };
    }

    public removeClient(id: string) {
        this.clients.delete(id);
        this.logger.log("A listener got disconnected");
    }

    public skip() {
        this.currentFile = null;
        this.throttle.end();
        this.throttle = null;
    }

    private next() {
        this.logger.log("Getting next track from queue");
        const next = this.queue.getNext();
        this.currentFile = next;

        this.loadStream(next);
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

    public start() {
        if(!isNull(this.currentFile)) return;
        this.logger.log("Starting stream");
        this.next();
        this.startStream();
    }

    private async getTrackBitrate(filepath: string) {
        const data = await ffprobe(filepath);
        const bitrate = data?.format?.bit_rate;

        return bitrate ? parseInt(bitrate) : 128000;
    }

    private loadStream(file: string) {
        if (!file) return;
        this.stream = createReadStream(file);
    }

    private async broadcast(chunk) {
        this.clients.forEach((client) => {
            client.write(chunk);
        });
    }
}