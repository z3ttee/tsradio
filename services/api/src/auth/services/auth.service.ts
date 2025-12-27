import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from './token.service';
import {
  TokenRequestDto,
  GrantType,
  TokenResponseDto,
  LoginDto,
} from '../dtos';
import { User } from '../../users/entities/user.entity';
import { ErrorCodes } from '../../errorCodes';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _tokenService: TokenService,
  ) {}

  public async handleTokenRequest(
    tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    switch (tokenRequest.grant_type) {
      case GrantType.AUTHORIZATION_CODE:
        return this._handleAuthorizationCodeGrant(tokenRequest);
      case GrantType.REFRESH_TOKEN:
        return this._handleRefreshTokenGrant(tokenRequest);
      default:
        throw new BadRequestException(ErrorCodes.UNSUPPORTED_GRANT_TYPE);
    }
  }

  public async login(loginDto: LoginDto): Promise<string> {
    const user = await this._usersService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    // TODO: Implement proper password verification with hashing
    // You need to add passwordHash field to User entity and implement bcrypt comparison
    const isPasswordValid = await this._verifyPassword(loginDto.password, user);
    if (!isPasswordValid) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Generate authorization code
    return this._tokenService.generateAuthorizationCode(
      user,
      loginDto.redirect_uri,
    );
  }

  public async getUserinfo(accessToken: string): Promise<{
    sub: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    updated_at?: number;
  }> {
    const payload = this._tokenService.verifyAccessToken(accessToken);
    const user = await this._usersService.findById(payload.sub);

    return {
      sub: user.id,
      name: user.displayName || user.username,
      preferred_username: user.username,
      email: user.email,
      updated_at: Math.floor(user.updatedAt.getTime() / 1000),
    };
  }

  public async revokeToken(token: string): Promise<void> {
    try {
      await this._tokenService.revokeRefreshToken(token);
    } catch {
      // RFC 7009: The authorization server responds with HTTP status code 200
      // even if the token was invalid
    }
  }

  public async introspectToken(token: string): Promise<{
    active: boolean;
    username?: string;
    token_type?: string;
    exp?: number;
    iat?: number;
    sub?: string;
    iss?: string;
  }> {
    try {
      const payload = this._tokenService.verifyAccessToken(token);
      const user = await this._usersService.findById(payload.sub);

      return {
        active: true,
        username: user.username,
        token_type: 'Bearer',
        exp: payload.exp,
        iat: payload.iat,
        sub: payload.sub,
        iss: payload.iss,
      };
    } catch {
      return { active: false };
    }
  }

  public async logout(userId: string): Promise<void> {
    await this._tokenService.revokeAllUserTokens(userId);
  }

  private async _handleAuthorizationCodeGrant(
    tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    if (!tokenRequest.code || !tokenRequest.redirect_uri) {
      throw new BadRequestException(ErrorCodes.INVALID_REQUEST);
    }

    const authCode = await this._tokenService.validateAuthorizationCode(
      tokenRequest.code,
      tokenRequest.redirect_uri,
    );

    return this._generateTokenResponse(authCode.user);
  }

  private async _handleRefreshTokenGrant(
    tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    if (!tokenRequest.refresh_token) {
      throw new BadRequestException(ErrorCodes.INVALID_REQUEST);
    }

    const refreshToken = await this._tokenService.validateRefreshToken(
      tokenRequest.refresh_token,
    );

    // Rotate refresh token
    await this._tokenService.revokeRefreshToken(tokenRequest.refresh_token);

    return this._generateTokenResponse(refreshToken.user);
  }

  private async _generateTokenResponse(user: User): Promise<TokenResponseDto> {
    const accessToken = this._tokenService.generateAccessToken(user);
    const refreshToken = await this._tokenService.generateRefreshToken(user);
    const idToken = this._tokenService.generateIdToken(user, accessToken);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this._tokenService.getAccessTokenTtl(),
      refresh_token: refreshToken,
      id_token: idToken,
    };
  }

  private async _verifyPassword(
    _password: string,
    _user: User,
  ): Promise<boolean> {
    // TODO: Implement proper password verification
    // 1. Add passwordHash field to User entity
    // 2. Use bcrypt: return bcrypt.compare(password, user.passwordHash);
    return false;
  }
}
