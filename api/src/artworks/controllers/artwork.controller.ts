import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ArtworkService } from "../services/artwork.service";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";
import { Roles } from "src/authentication/decorators/role.decorator";
import { ROLE_ADMIN } from "src/constants";
import { SharpPipe } from "../pipes/sharp.pipe";
import { Public } from "src/authentication/decorators/public.decorator";

@Controller("artworks")
export class ArtworkController {

    constructor(private readonly service: ArtworkService) {}

    @Public(true)
    @Get(":artworkId")
    public findById(@Param("artworkId") artworkId: string, @Res() response: Response) {
        return this.service.streamArtwork(artworkId, response);
    }

    @Roles(ROLE_ADMIN)
    @Post("channel/:channelId")
    @UseInterceptors(FileInterceptor('file'))
    public setChannelArtwork(@Param("channelId") channelId: string, @UploadedFile(SharpPipe) file: string) {
        return this.service.setChannelArtwork(file, channelId);
    }

}