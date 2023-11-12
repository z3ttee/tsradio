import { Controller, Get, Param } from "@nestjs/common";
import { HistoryService } from "../services/history.service";
import { Public } from "../../authentication/decorators/public.decorator";
import { Pagination } from "@tsa/nestjs";
import { Pageable } from "@tsa/utilities";

@Controller("history")
export class HistoryController {

    constructor(
        private readonly service: HistoryService
    ) {}

    @Public(true)
    @Get(":channelId")
    public findByChannelId(@Param("channelId") channelId: string, @Pagination() pageable: Pageable) {
        return this.service.findValuesByChannelId(channelId, pageable);
    }

}