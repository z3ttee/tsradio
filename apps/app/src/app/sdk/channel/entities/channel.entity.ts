import { Artwork } from "../../../modules/artwork/entities/artwork.entity";
import { StreamStatus } from "../../stream";
import { Track } from "../../track";

export class Channel {
    public readonly id: string;
    public readonly slug: string;
    public name: string;
    public description: string;
    public enabled: boolean;
    public featured: boolean;
    public artwork: Artwork;
    public tracks?: Track[];
    public currentTrack?: Track;
    public status?: StreamStatus;
    public listeners?: number;
}