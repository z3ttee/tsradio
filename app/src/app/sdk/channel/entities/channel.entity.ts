import { Artwork } from "src/app/modules/artwork/entities/artwork.entity";

export class Channel {

    public readonly id: string;
    public readonly slug: string;
    public name: string;
    public description: string;
    public enabled: boolean;
    public featured: boolean;
    public artwork: Artwork;
    
}