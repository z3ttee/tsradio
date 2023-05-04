import { Artwork } from "src/app/modules/artwork/entities/artwork.entity";
import { StreamStatus, Track } from "../../stream";

export class Channel {

    public readonly id: string;
    public readonly slug: string;
    public name: string;
    public description: string;
    public enabled: boolean;
    public featured: boolean;
    public artwork: Artwork;
    public track?: Track;
    public status?: StreamStatus;
    
}