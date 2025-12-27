import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { TokenRequestDto, TokenResponseDto, LoginDto } from '../dtos';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  /**
   * Login Endpoint
   * Authenticates user with username/password and returns an authorization code.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() loginDto: LoginDto): Promise<{ code: string }> {
    const code = await this._authService.login(loginDto);
    return { code };
  }

  /**
   * Token Endpoint (RFC 6749 Section 3.2)
   * Supports authorization_code and refresh_token grant types.
   */
  @Post('token')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'no-store')
  @Header('Pragma', 'no-cache')
  public async token(
    @Body() tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    return this._authService.handleTokenRequest(tokenRequest);
  }

  /**
   * Userinfo Endpoint (OpenID Connect Core Section 5.3)
   * Returns claims about the authenticated end-user.
   */
  @Get('userinfo')
  @UseGuards(JwtAuthGuard)
  public async getUserinfo(@Req() req: AuthenticatedRequest): Promise<{
    sub: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    updated_at?: number;
  }> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('invalid_token');
    }
    return this._authService.getUserinfo(token);
  }

  /**
   * Revocation Endpoint (RFC 7009)
   * Revokes a refresh token.
   */
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  public async revoke(@Body() body: { token: string }): Promise<void> {
    await this._authService.revokeToken(body.token);
  }

  /**
   * Introspection Endpoint (RFC 7662)
   * Returns information about a token.
   */
  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  public async introspect(@Body() body: { token: string }): Promise<{
    active: boolean;
    username?: string;
    token_type?: string;
    exp?: number;
    iat?: number;
    sub?: string;
    iss?: string;
  }> {
    return this._authService.introspectToken(body.token);
  }

  /**
   * Logout Endpoint
   * Revokes all refresh tokens for the authenticated user.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  public async logout(@Req() req: AuthenticatedRequest): Promise<void> {
    await this._authService.logout(req.user.sub);
  }
}
