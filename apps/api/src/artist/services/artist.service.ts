import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Artist } from "../entities/artist.entity";
import { In, Repository } from "typeorm";
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
        return this.findByIds([artistId]).then((artists) => artists[0]);
    } 

    /**
     * Find list of artist by their ids
     * @param artistIds Ids of the artists
     * @returns List of artists
     */
    public async findByIds(artistIds: string[]): Promise<Artist[]> {
        if(isNull(artistIds)) return [];
        return this.repository.find({
            where: {
                id: In(artistIds.filter((id) => !isNull(id)))
            }
        });
    } 

    /**
     * Create an artist or find when exists
     * @param dto Data to create in database
     * @returns List of created or existing artists
     */
    public async createOrFind(dto: CreateArtistDTO | CreateArtistDTO[]): Promise<Artist[]> {
        const values: Artist[] = [];

        if(Array.isArray(dto)) {
            // Create for every dto an 
            // artist object
            values.push(...dto.map((d) => {
                const artist = new Artist();
                artist.name = d.name;
                return artist;
            }));
        } else {
            // Create single artist and push
            // to list
            const artist = new Artist();
            artist.name = dto.name;
            values.push(artist);
        }

        // If there are no values,
        // just return empty array as this 
        // is not an invalid request
        if(values.length <= 0) return [];

        return this.repository.createQueryBuilder()
            .insert()
            .values(values)
            .orUpdate(["name"], ["id"])
            .execute().then((insertResult) => {
                if(insertResult.identifiers.length <= 0) throw new InternalServerErrorException("Failed creating artist in the database");
                // Always use `raw` here, because other fields are generated values by
                // typeorm. So the actual id in the database only appears in `raw` object
                const ids = insertResult.raw?.map((obj) => obj.id);
                return this.findByIds(ids);
            });
    }

}
