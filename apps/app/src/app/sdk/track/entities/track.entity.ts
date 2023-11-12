import { Artist } from "../../artist";
import { Channel } from "../../channel";

export interface Track {
    readonly id: string;
    readonly name: string;
    readonly filename?: string;
    readonly album?: string;
    readonly featuredArtists?: Artist[];
    readonly primaryArtist?: Artist;
    readonly channel: Channel;
}
