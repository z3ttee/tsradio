import { isNull } from "@tsa/utilities";
import { Track } from "../../track";
import NodeID3 from "node-id3";
import path from "node:path";
import { Artist } from "../../artist";
import { Logger } from "@nestjs/common";

const logger = new Logger("MetadataService");

export function readID3Tags(file: string): Promise<Track | null> {
    if(isNull(file)) return Promise.resolve(null);
    return new Promise<Track>((resolve) => {
        const tags = NodeID3.read(file);

        if(isNull(tags)) {
            resolve(null);
        } else {
            const artists = tags.artist?.split(",") ?? [];
            const primaryArtistName = artists.splice(0, 1)?.[0]
            const primaryArtist = isNull(primaryArtistName) ? null : {
                name: primaryArtistName
            };

            const track = new Track();
            track.name = tags.title ?? path.basename(file);
            track.album = tags.album;
            track.primaryArtist = primaryArtist as Artist;
            track.filename = path.basename(file);
            track.featuredArtists = artists.map((name) => ({
                name: name
            } as Artist));

            resolve(track);
        }
    }).catch((error: Error) => {
        logger.error(`Error whilst reading ID3 tags from file '${file}': ${error.message}`, error);
        return null;
    });
}