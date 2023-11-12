import { Injectable, PipeTransform } from "@nestjs/common";
import path from "node:path";
import sharp from "sharp";
import { FileSystemService } from "../../filesystem/services/filesystem.service";
import { randomString } from "@tsa/utilities";

@Injectable()
export class SharpPipe implements PipeTransform<Express.Multer.File, Promise<string>> {

    constructor(private readonly fs: FileSystemService) {}

    async transform(image: Express.Multer.File): Promise<string> {
        const filename = randomString(32) + '.webp';
        
        return sharp(image.buffer)
            .resize(512)
            .webp({ effort: 3 })
            .toFile(path.join(this.fs.getArtworkRootDir(), filename)).then((outputInfo) => {
                return filename;
            });
      }

}