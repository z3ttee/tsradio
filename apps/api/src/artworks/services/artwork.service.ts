import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Artwork } from "../entities/artwork.entity";
import { Repository } from "typeorm";
import { Response } from "express";
import { access, createReadStream, unlinkSync } from "node:fs";
import { ChannelService } from "../../channel/services/channel.service";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { Channel } from "../../channel/entities/channel.entity";
import { isNull } from "@tsa/utilities";

@Injectable()
export class ArtworkService {
    private readonly logger = new Logger(ArtworkService.name);

    constructor(
        private readonly fs: FileSystemService,
        private readonly channelService: ChannelService,
        @InjectRepository(Artwork) private readonly repository: Repository<Artwork>
    ) {}

    public async findById(id: string) {
        return this.repository.findOne({
            where: {
                id: id
            }
        })
    }

    public async streamArtwork(artworkId: string, response: Response): Promise<void> {
        const artwork = await this.findById(artworkId);
        if(!artwork) throw new NotFoundException("Could not find artwork.");

        return new Promise((resolve, reject) => {
            const filepath = this.fs.resolveArtworkPath(artwork);

            access(filepath, (err) => {
                if(err) {
                    reject(new NotFoundException("Could not find artwork file."));
                    return;
                }

                const stream = createReadStream(filepath).pipe(response);
                stream.on("finish", () => resolve());
                stream.on("error", () => reject(new InternalServerErrorException("Failed reading artwork file.")));
            });
        }) 
    }

    public async setChannelArtwork(file: string, id: string): Promise<Artwork> {
        const channel = await this.channelService.findById(id);
        if(isNull(channel)) throw new BadRequestException("Channel not found");

        if(!isNull(channel.artwork)) {
            await this.deleteById(channel.artwork.id).catch((err) => {
                this.logger.error(err);
                throw new BadRequestException("Could not remove previous artwork");
            });
        }

        const artwork = new Artwork();
        artwork.filename = file;
        artwork.channel = { id: id } as Channel;

        return this.repository.save(artwork);
    }

    public async deleteById(id: string): Promise<boolean>;
    public async deleteById(artwork: Artwork): Promise<boolean>;
    public async deleteById(idOrArtwork: string | Artwork): Promise<boolean> {
        let artwork: Artwork = null;
        if(typeof idOrArtwork === "string") {
            artwork = await this.findById(idOrArtwork);
        } else {
            artwork = idOrArtwork;
        }

        const file = this.fs.resolveArtworkPath(artwork);
        return this.repository.delete(artwork.id).then((result) => result.affected > 0).then((deleted) => {
            if(deleted) unlinkSync(file);
            return deleted;
        });
    }

}