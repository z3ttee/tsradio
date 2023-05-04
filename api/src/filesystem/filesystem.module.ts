import { DynamicModule, Module } from '@nestjs/common';
import { FileSystemService } from './services/filesystem.service';
import { mkdirSync } from 'fs';

@Module({
  
})
export class FileSystemModule {

  public static forRoot(): DynamicModule {
    return {
      module: FileSystemModule,
      global: true,
      providers: [
        FileSystemService,
        {
          provide: "__filesystem_setup__",
          inject: [ FileSystemService ],
          useFactory: async (service: FileSystemService) => {
            mkdirSync(service.getArtworkRootDir(), { recursive: true });
            mkdirSync(service.getChannelsRootDir(), { recursive: true });
            return true;
          }
        }
      ],
      exports: [
        FileSystemService
      ]
    }
  }

}
