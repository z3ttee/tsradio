import { IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { Channel } from "../../channel/entities/channel.entity";

export class CreateTrackDTO {
    @IsString()
    @MaxLength(254)
    @MinLength(1)
    public readonly name: string;

    @IsString()
    @IsUUID("4")
    public readonly channelId: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    @MinLength(1)
    public readonly primaryArtistName?: string;

    @IsOptional()
    @IsString()
    public readonly featuredArtists?: string;

    @IsOptional()
    @IsString()
    public readonly album?: string;
}
