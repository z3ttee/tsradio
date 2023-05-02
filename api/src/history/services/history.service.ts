import { BadRequestException, Injectable } from "@nestjs/common";
import { Page, Pageable, isNull } from "@soundcore/common";
import { HistoryItem } from "../entities/history-item";
import { HistoryManager } from "./history-manager.service";
import { Track } from "src/streams/entities/track";

@Injectable()
export class HistoryService {

    private readonly histories: Map<string, HistoryManager> = new Map();

    constructor(
        
    ) {}

    public async findValuesByChannelId(channelId: string, pageable: Pageable): Promise<Page<HistoryItem>> {
        const manager = this.histories.get(channelId);
        if(isNull(manager)) throw new BadRequestException("Channel has no history");

        return Page.of(manager.values(), manager.size, pageable);
    }

    public async findByChannelId(channelId: string) {
        return this.histories.get(channelId);
    }

    public async addToHistory(channelId: string, track: Track) {
        let manager: HistoryManager;

        if(!this.histories.has(channelId)) {
            manager = await this.createHistory(channelId);
        } else {
            manager = await this.findByChannelId(channelId);
        }

        manager.add(track);
    }

    public async createHistory(channelId: string) {
        this.histories.set(channelId, new HistoryManager());
        return this.histories.get(channelId);
    }

    public async removeHistory() {

    }

}