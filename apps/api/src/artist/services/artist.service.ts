import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Artist } from "../entities/artist.entity";
import { Repository } from "typeorm";
import { isNull } from "@tsa/utilities";
import { CreateArtistDTO } from "../dtos/create-artist.dto";

@Injectable()
export class ArtistService {

    constructor(
        @InjectRepository(Artist)
        private readonly repository: Repository<Artist>
    ) {}

    /**
     * Find an artist by its id
     * @param artistId Id of the artist
     * @returns Instance of the artist data or `null` if not found
     */
    public async findById(artistId: string): Promise<Artist | null> {
        if(isNull(artistId)) return null;
        return this.repository.findOne({
            where: {
                id: artistId
            }
        });
    } 

    /**
     * Create an artist or find when exists
     * @param dto Data to create in database
     * @returns Instance of artist data or `null` if not found
     */
    public async createOrFind(dto: CreateArtistDTO): Promise<Artist | null> {
        const artist = new Artist();
        artist.name = dto.name;

        return this.repository.createQueryBuilder()
            .insert()
            .values(artist)
            .orUpdate(["name"], ["id"])
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) throw new InternalServerErrorException("Failed creating artist in the database");
                const id = insertResult.identifiers[0]?.id;
                return this.findById(id);
            });
    }

}
