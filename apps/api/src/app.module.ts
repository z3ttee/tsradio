import { Module } from '@nestjs/common';
import { ChannelModule } from './channel/channel.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OIDCModule } from './authentication/oidc.module';
import { FileSystemModule } from './filesystem/filesystem.module';
import { ArtworkModule } from './artworks/artwork.module';
import { StreamModule } from './streams/streamer.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from './schedule/schedule.module';
import { PlaylistModule } from './playlist/playlist.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        ".env.dev",
        ".env"
      ]
    }),
    TypeOrmModule.forRootAsync({
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        type: "mariadb",
        host: config.get("DB_HOST"),
        port: parseInt(config.get("DB_PORT")),
        username: config.get("DB_USER"),
        password: config.get("DB_PASS"),
        database: config.get("DB_NAME"),
        entityPrefix: config.get("DB_PREFIX"), 
        synchronize: true,
        autoLoadEntities: true,
        charset: "utf8mb4",
      })
    }),
    OIDCModule.forRoot({
      issuer: process.env.OIDC_ISSUER,
      client_id: process.env.OIDC_CLIENT_ID
    }),
    FileSystemModule.forRoot(),
    EventEmitterModule.forRoot(),
    ArtworkModule,
    ChannelModule,
    StreamModule,
    ScheduleModule,
    PlaylistModule
  ],
})
export class AppModule {}
