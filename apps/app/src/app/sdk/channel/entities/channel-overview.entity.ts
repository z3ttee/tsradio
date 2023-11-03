import { Channel } from "./channel.entity";

export interface ChannelOverview {
    readonly featured: Channel[];
    readonly nonfeatured: Channel[];
}
