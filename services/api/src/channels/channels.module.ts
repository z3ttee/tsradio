import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel } from './entities/channel.entity';
import { ChannelsService } from './services/channels.service';
import { ChannelsController } from './controllers/channels.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Channel])],
  controllers: [ChannelsController],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
