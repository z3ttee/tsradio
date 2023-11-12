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

        if(!isNull(dto.primaryArtistName)) {
            primaryArtist = await this.artistService.createOrFind({
                name: dto.primaryArtistName
            });
        }

        console.log(primaryArtist);

        const track = new Track();
        track.name = dto.name;
        track.album = dto.album;
        track.featuredArtists = dto.featuredArtists;
        track.channel = { id: dto.channelId } as Channel;
        track.primaryArtist = primaryArtist;

        return this.repository.createQueryBuilder()
            .insert()
            .values(track)
            .orUpdate(["name", "primaryArtistId",  "featuredArtists", "album", "channelId"], ["id"])
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) throw new InternalServerErrorException("Failed creating track");
                const id = insertResult.identifiers[0]?.id;
                return this.findById(id);
            })
    }

}
