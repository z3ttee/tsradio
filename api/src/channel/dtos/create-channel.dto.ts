import { Channel } from "../entities/channel.entity";

export class CreateChannelDTO implements 
    Pick<Channel, "name">,
    Partial<Pick<Channel, "description" | "enabled" | "featured">>
{
    name: string;
    description?: string;
    enabled?: boolean;
    featured?: boolean;
}