import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { TokenService } from './token.service';
import { TokenRequestDto, GrantType, TokenResponseDto } from '../dtos';
import { User } from '../../users/entities/user.entity';

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
      case GrantType.CLIENT_CREDENTIALS:
        return this._handleClientCredentialsGrant(tokenRequest);
      default:
        throw new BadRequestException('unsupported_grant_type');
    }
  }

  public async generateAuthorizationCode(
    userId: string,
    clientId: string,
    redirectUri: string,
    scopes: string[],
    codeChallenge?: string,
    codeChallengeMethod?: string,
    nonce?: string,
  ): Promise<string> {
    const user = await this._usersService.findById(userId);
    return this._tokenService.generateAuthorizationCode(
      user,
      clientId,
      redirectUri,
      scopes,
      codeChallenge,
      codeChallengeMethod,
      nonce,
    );
  }

  public async getUserinfo(accessToken: string): Promise<{
    sub: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    email_verified?: boolean;
    updated_at?: number;
  }> {
    const payload = this._tokenService.verifyAccessToken(accessToken);
    const user = await this._usersService.findById(payload.sub);

    const userinfo: {
      sub: string;
      name?: string;
      preferred_username?: string;
      email?: string;
      email_verified?: boolean;
      updated_at?: number;
    } = {
      sub: user.id,
    };

    userinfo.name = user.displayName || user.username;
    userinfo.preferred_username = user.username;
    userinfo.updated_at = Math.floor(user.updatedAt.getTime() / 1000);

    userinfo.email = user.email;
    userinfo.email_verified = true; // You might want to track this in the User entity

    return userinfo;
  }

  public async revokeToken(
    token: string,
    tokenTypeHint?: string,
  ): Promise<void> {
    try {
      if (tokenTypeHint === 'refresh_token' || !tokenTypeHint) {
        await this._tokenService.revokeRefreshToken(token);
      }
      // Access tokens are stateless, so we can't revoke them
      // In production, you might want to use a token blocklist
    } catch {
      // RFC 7009: The authorization server responds with HTTP status code 200
      // even if the token was invalid
    }
  }

  public async introspectToken(
    token: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenTypeHint?: string,
  ): Promise<{
    active: boolean;
    scope?: string;
    client_id?: string;
    username?: string;
    token_type?: string;
    exp?: number;
    iat?: number;
    sub?: string;
    aud?: string | string[];
    iss?: string;
  }> {
    try {
      const payload = this._tokenService.verifyAccessToken(token);
      const user = await this._usersService.findById(payload.sub);

      return {
        active: true,
        client_id:
          typeof payload.aud === 'string' ? payload.aud : payload.aud?.[0],
        username: user.username,
        token_type: 'Bearer',
        exp: payload.exp,
        iat: payload.iat,
        sub: payload.sub,
        aud: payload.aud,
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
    if (
      !tokenRequest.code ||
      !tokenRequest.client_id ||
      !tokenRequest.redirect_uri
    ) {
      throw new BadRequestException('invalid_request');
    }

    const authCode = await this._tokenService.validateAuthorizationCode(
      tokenRequest.code,
      tokenRequest.client_id,
      tokenRequest.redirect_uri,
      tokenRequest.code_verifier,
    );

    return this._generateTokenResponse(
      authCode.user,
      authCode.clientId,
      authCode.nonce,
    );
  }

  private async _handleRefreshTokenGrant(
    tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    if (!tokenRequest.refresh_token) {
      throw new BadRequestException('invalid_request');
    }

    const refreshToken = await this._tokenService.validateRefreshToken(
      tokenRequest.refresh_token,
    );

    // Optionally rotate refresh token
    await this._tokenService.revokeRefreshToken(tokenRequest.refresh_token);

    return this._generateTokenResponse(
      refreshToken.user,
      refreshToken.clientId,
    );
  }

  private _handleClientCredentialsGrant(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tokenRequest: TokenRequestDto,
  ): Promise<TokenResponseDto> {
    // Client credentials grant is typically used for machine-to-machine communication
    // This requires client authentication which should be implemented based on your needs
    throw new BadRequestException('unsupported_grant_type');
  }

  private async _generateTokenResponse(
    user: User,
    clientId: string,
    nonce?: string,
  ): Promise<TokenResponseDto> {
    const accessToken = this._tokenService.generateAccessToken(
      user,
      clientId,
      nonce,
    );

    const refreshToken = await this._tokenService.generateRefreshToken(
      user,
      clientId,
    );

    const response: TokenResponseDto = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: this._tokenService.getAccessTokenTtl(),
      refresh_token: refreshToken,
    };

    // Include ID token if openid scope is requested
    response.id_token = this._tokenService.generateIdToken(
      user,
      clientId,
      nonce,
      accessToken,
    );

    return response;
  }
}
