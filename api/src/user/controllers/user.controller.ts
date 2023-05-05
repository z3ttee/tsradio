import { Body, Controller, Get, Put } from "@nestjs/common";
import { UserService } from "../services/user.service";
import { Authentication } from "src/authentication/decorators/authentication.decorator";
import { User } from "../entities/user.entity";
import { AddToHistoryDTO } from "../dtos/add-to-history.dto";

@Controller("users")
export class UsersController {

    constructor(private readonly service: UserService) {}

    @Get("history")
    public findHistoryByCurrentUser(@Authentication() user: User) {
        return this.service.findChannelHistoryByCurrentUser(user.id);
    }

    @Put("history")
    public addToHistory(@Body() addToHistoryDto: AddToHistoryDTO, @Authentication() user: User) {
        return this.service.addChannelToHistory(user.id, addToHistoryDto.channelId);
    }

}