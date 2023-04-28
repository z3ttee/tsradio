import { Channel } from "../entities/channel.entity";

export class CreateChannelDTO implements 
    Pick<Channel, "name" | "mountpoint">,
    Partial<Pick<Channel, "description" | "enabled" | "featured" | "color">>
{
    name: string;
    mountpoint: string;
    description?: string;
    enabled?: boolean;
    featured?: boolean;
    color?: string;
}