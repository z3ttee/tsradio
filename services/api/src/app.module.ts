import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';

@Module({
  imports: [HealthModule, UsersModule, ChannelsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
