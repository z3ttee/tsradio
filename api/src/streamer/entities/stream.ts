import { Channel } from "src/channel/entities/channel.entity";
import { StreamQueue } from "./stream-queue";
import { ReadStream, createReadStream } from "node:fs";
import Throttle from "throttle";
import { PassThrough } from "node:stream";
import { randomString } from "@soundcore/common";

export class Stream {

    private readonly queue: StreamQueue = new StreamQueue(this.channel);
    private readonly clients: Map<string, PassThrough> = new Map();

    private stream: ReadStream;
    private throttle: Throttle;

    private currentFile: string;

    constructor(private readonly channel: Channel) {
        console.log(this.queue);
    }

    public addClient() {
        const id = randomString(32);
        const client = new PassThrough();

        this.clients.set(id, client);

        console.log("added client");
        return { id, client };
    }

    public removeClient(id: string) {
        this.clients.delete(id);
        console.log("removed client");
    }

    public next() {
        console.log("next")
        const next = this.queue.getNext();
        this.currentFile = next;

        this.loadStream(next);
    }

    public get started() {
        return this.stream && this.throttle && this.currentFile;
    }

    public async start() {
        const file = this.currentFile;
        if (!file) return;

        const bitrate = await this.queue.getTrackBitrate(file);
        this.throttle = new Throttle(bitrate / 8);

        this.stream
            .pipe(this.throttle)
            .on("data", (chunk) => this.broadcast(chunk))
            .on("end", () => this.play(true))
            .on("error", () => this.play(true));
    }

    public pause() {
        if (!this.started) return;
        console.log("Paused");
        this.throttle.removeAllListeners("end");
        this.throttle.end();
    }

    public resume() {
        if (!this.started) return;
        console.log("Resumed");
        this.start();
    }

    public play(useNewTrack = false) {
        if (useNewTrack || !this.currentFile) {
            console.log("Playing new track");
            this.next();
            this.start();
        } else {
            this.resume();
        }
    }

    private loadStream(file: string) {
        if (!file) return;
        console.log("Starting audio stream");
        this.stream = createReadStream(file);
    }

    public async broadcast(chunk) {
        // console.log("broadcasting")
        this.clients.forEach((client) => {
            client.write(chunk);
        });
    }



}