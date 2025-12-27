import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { AuthorizationCode } from './entities/authorization-code.entity';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WellKnownController } from './controllers/well-known.controller';
import { TokenController } from './controllers/token.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken, AuthorizationCode]),
    UsersModule,
  ],
  controllers: [AuthController, TokenController, WellKnownController],
  providers: [AuthService, TokenService, JwtAuthGuard],
  exports: [AuthService, TokenService, JwtAuthGuard],
})
export class AuthModule {}
