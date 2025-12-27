import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers';
import { AuthService, TokenService } from './services';
import { RefreshToken, AuthorizationCode } from './entities';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, AuthorizationCode]),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, TokenService, JwtAuthGuard],
  exports: [AuthService, TokenService, JwtAuthGuard],
})
export class AuthModule {}
