import { IsArray, IsObject, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateNested } from "class-validator";
import { Channel } from "../../channel/entities/channel.entity";
import { Type } from "class-transformer";

export class CreateTrackDTO {
    @IsString()
    @MaxLength(254)
    @MinLength(1)
    public readonly name: string;

    @IsString()
    @MaxLength(254)
    @MinLength(1)
    public readonly filename: string;

    @IsString()
    @IsUUID("4")
    public readonly channelId: string;

    @IsOptional()
    @IsString()
    @MaxLength(120)
    @MinLength(1)
    public readonly primaryArtistName?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    public readonly featuredArtistNames?: string[];

    @IsOptional()
    @IsString()
    public readonly album?: string;
}
