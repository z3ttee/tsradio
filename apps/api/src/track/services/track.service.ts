import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Track } from "../entities/track.entity";
import { Repository } from "typeorm";
import { isNull } from "@tsa/utilities";
import { CreateTrackDTO } from "../dtos/create-track.dto";
import { Channel } from "../../channel/entities/channel.entity";
import { Artist, ArtistService } from "../../artist";

@Injectable()
export class TrackService {

    constructor(
        private readonly artistService: ArtistService,
        @InjectRepository(Track)
        private readonly repository: Repository<Track>
    ) {}

    /**
     * Find a track by its id
     * @param trackId Id of the track
     * @returns Instance of the track data or `null` if not found
     */
    public async findById(trackId: string): Promise<Track | null> {
        if(isNull(trackId)) return null;
        return this.repository.findOne({
            where: {
                id: trackId
            },
            relations: {
                primaryArtist: true
            }
        });
    }

    /**
     * Create a track in the database or return data if already exists
     * @param dto Data to create track with
     * @returns Instance of track data or `null` if failed/not found
     */
    public async createOrFind(dto: CreateTrackDTO): Promise<Track | null> {
        const featuredArtists: Artist[] = [];
        let primaryArtist: Artist | null = null;

        // Create primary artist
        if(!isNull(dto.primaryArtistName)) {
            const artists = await this.artistService.createOrFind({
                name: dto.primaryArtistName
            });
            console.log("artists:", artists);
            primaryArtist = artists[0];
        }

        // Create featured artists
        if(!isNull(dto.featuredArtistNames)) {
            const artists = await this.artistService.createOrFind(dto.featuredArtistNames.map((name) => ({
                name: name
            })));
            featuredArtists.push(...artists);
        }

        // Create new track entity
        const track = new Track();
        track.name = dto.name;
        track.album = dto.album;
        track.channel = { id: dto.channelId } as Channel;
        track.primaryArtist = primaryArtist;
        track.filename = dto.filename;

        return this.repository.createQueryBuilder()
            .insert()
            .values(track)
            .orUpdate(["name", "primaryArtistId", "album", "channelId", "filename"], ["id"])
            .execute().then((insertResult) => {
                // Handle insert result
                if(insertResult.identifiers.length <= 0) throw new InternalServerErrorException("Failed creating track");
                const id = insertResult.identifiers[0]?.id;

                // Find track by its id
                return this.findById(id).then((track) => {
                    // Add featured artists
                    track.featuredArtists = featuredArtists;
                    // Return saved entity
                    return this.repository.save(track);
                });
            })
    }

}
