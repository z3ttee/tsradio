import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateArtistDTO {
    @IsString()
    @MaxLength(120)
    @MinLength(1)
    public readonly name: string;
}
