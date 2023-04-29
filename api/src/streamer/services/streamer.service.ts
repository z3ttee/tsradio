import { Inject, Injectable } from "@nestjs/common";
import path from "node:path";
import { Channel } from "src/channel/entities/channel.entity";
import { ChannelRegistry } from "src/channel/services/registry.service";
import workerpool from "workerpool";
import { StreamerCoordinator } from "../coordinator/coordinator.service";
import { OnEvent } from "@nestjs/event-emitter";
import { EVENT_CHANNEL_CREATED } from "src/constants";
import { Stream } from "../entities/stream";

@Injectable()
export class StreamerService {

    private readonly _pool: workerpool.WorkerPool;

    private readonly streams: Map<string, Stream> = new Map();

    constructor(
        private readonly registry: ChannelRegistry,
        private readonly coordinator: StreamerCoordinator
    ) {
        // Create worker pool
        this._pool = workerpool.pool(path.resolve(__dirname, "..", "worker", "streamer.worker.js"), {
            workerType: "process",
            forkOpts: {
                env: {
                    ...process.env
                }
            }
        });

        // Start streamers
        for(const channel of registry.values()) {
            // this.startStreamer(channel);

            this.startStream(channel);
        }
    }

    public startStream(channel: Channel) {
        if(!this.streams.has(channel.id)) {
            const stream = new Stream(channel);
            this.streams.set(channel.id, stream);
            stream.play();
        }

        return this.streams.get(channel.id);
    }

    @OnEvent(EVENT_CHANNEL_CREATED)
    public handleChannelCreatedEvent(channel: Channel) {
        this.startStreamer(channel);
    }

    private async startStreamer(channel: Channel) {
        this._pool.exec("default", [ {...process.env}, channel, this.coordinator.issueToken(channel) ], {
            on: (event: any) => {
                // this.queue.fireEvent(event.name, event.job, event.error);
            }
        }).then((result) => {
            console.log("Streamer exited (0)");
        }).catch((err: Error) => {
            console.log("Streamer exited (1)");
            console.error(err);
        });
    }
}