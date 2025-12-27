import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth';

@Module({
  imports: [HealthModule, UsersModule, ChannelsModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
