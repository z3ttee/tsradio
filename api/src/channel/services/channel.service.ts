import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Channel } from "../entities/channel.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateChannelDTO } from "../dtos/create-channel.dto";
import { Page, Pageable } from "@soundcore/common";

@Injectable()
export class ChannelService {

    constructor(
        @InjectRepository(Channel) private readonly repository: Repository<Channel>
    ) {}

    public async findById(id: string): Promise<Channel> {
        return this.repository.findOneOrFail({ 
            where: { 
                id: id
            }
        });
    }

    public async findAll(pageable: Pageable): Promise<Page<Channel>> {
        return this.repository.createQueryBuilder("channel")
            .limit(pageable.limit)
            .offset(pageable.offset)
            .getManyAndCount().then(([channels, total]) => Page.of(channels, total, pageable));
    }

    public async createIfNotExists(dto: CreateChannelDTO): Promise<Channel> {
        return this.repository.createQueryBuilder()
            .insert()
            .orUpdate(["name", "mountpoint"], ["id"], { skipUpdateIfNoValuesChanged: false })
            .values(dto)
            .execute().then((insertResult) => {
                console.log(insertResult);
                if(insertResult.identifiers.length <= 0) return null;
                
                // return this.repository.
            })
    }

}