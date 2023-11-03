import { Channel } from "./channel.entity";

export class ChannelOverview {
    constructor(
        public readonly featured: Channel[],
        public readonly nonfeatured: Channel[]
    ) {}
}
