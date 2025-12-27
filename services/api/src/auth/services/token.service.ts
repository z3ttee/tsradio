import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import * as crypto from 'crypto';
import { RefreshToken } from '../entities/refresh-token.entity';
import { AuthorizationCode } from '../entities/authorization-code.entity';
import { User } from '../../users/entities/user.entity';
import { ErrorCodes } from '../../errorCodes';

export interface JwtPayload {
  sub: string;
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  nonce?: string;
  // OpenID Connect claims
  name?: string;
  preferred_username?: string;
  email?: string;
}

export interface IdTokenPayload extends JwtPayload {
  auth_time?: number;
  at_hash?: string;
}

@Injectable()
export class TokenService {
  private readonly _jwtSecret: string;
  private readonly _issuer: string;
  private readonly _accessTokenTtl: number;
  private readonly _refreshTokenTtl: number;
  private readonly _authCodeTtl: number;

  constructor(
    @InjectRepository(RefreshToken)
    private readonly _refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(AuthorizationCode)
    private readonly _authCodeRepository: Repository<AuthorizationCode>,
  ) {
    this._jwtSecret =
      process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this._issuer = process.env.OIDC_ISSUER || 'http://localhost:3000';
    this._accessTokenTtl = parseInt(process.env.ACCESS_TOKEN_TTL || '3600', 10);
    this._refreshTokenTtl = parseInt(
      process.env.REFRESH_TOKEN_TTL || '604800',
      10,
    );
    this._authCodeTtl = parseInt(process.env.AUTH_CODE_TTL || '600', 10);
  }

  public generateAccessToken(
    user: User,
    clientId: string,
    nonce?: string,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: JwtPayload = {
      sub: user.id,
      iss: this._issuer,
      aud: clientId,
      exp: now + this._accessTokenTtl,
      iat: now,
    };

    if (nonce) {
      payload.nonce = nonce;
    }

    payload.name = user.displayName || user.username;
    payload.preferred_username = user.username;
    payload.email = user.email;

    return this._signJwt(payload);
  }

  public generateIdToken(
    user: User,
    clientId: string,
    nonce?: string,
    accessToken?: string,
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const payload: IdTokenPayload = {
      sub: user.id,
      iss: this._issuer,
      aud: clientId,
      exp: now + this._accessTokenTtl,
      iat: now,
      auth_time: now,
    };

    if (nonce) {
      payload.nonce = nonce;
    }

    if (accessToken) {
      payload.at_hash = this._generateAtHash(accessToken);
    }

    payload.name = user.displayName || user.username;
    payload.preferred_username = user.username;
    payload.email = user.email;

    return this._signJwt(payload);
  }

  public async generateRefreshToken(
    user: User,
    clientId: string,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this._refreshTokenTtl * 1000);

    const refreshToken = this._refreshTokenRepository.create({
      user,
      clientId,
      expiresAt,
    });

    await this._refreshTokenRepository.save(refreshToken);
    return token;
  }

  public async generateAuthorizationCode(
    user: User,
    clientId: string,
    redirectUri: string,
    scopes: string[],
    codeChallenge?: string,
    codeChallengeMethod?: string,
    nonce?: string,
  ): Promise<string> {
    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this._authCodeTtl * 1000);

    const authCode = this._authCodeRepository.create({
      code,
      user,
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      nonce,
      expiresAt,
    });

    await this._authCodeRepository.save(authCode);
    return code;
  }

  public async validateAuthorizationCode(
    code: string,
    clientId: string,
    redirectUri: string,
    codeVerifier?: string,
  ): Promise<AuthorizationCode> {
    const authCode = await this._authCodeRepository.findOne({
      where: { code, clientId, redirectUri },
      relations: ['user'],
    });

    if (!authCode) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    if (authCode.expiresAt < new Date()) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    // Verify PKCE if code challenge was provided
    if (authCode.codeChallenge) {
      if (!codeVerifier) {
        throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
      }

      const isValid = this._verifyCodeChallenge(
        codeVerifier,
        authCode.codeChallenge,
        authCode.codeChallengeMethod || 'plain',
      );

      if (!isValid) {
        throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
      }
    }

    // Mark as used
    await this._authCodeRepository.delete(authCode.id);

    return authCode;
  }

  public async validateRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this._refreshTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    if (refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    return refreshToken;
  }

  public async revokeRefreshToken(token: string): Promise<void> {
    await this._refreshTokenRepository.delete({ token });
  }

  public async revokeAllUserTokens(userId: string): Promise<void> {
    await this._refreshTokenRepository.delete({ user: { id: userId } });
  }

  public verifyAccessToken(token: string): JwtPayload {
    return this._verifyJwt(token);
  }

  public async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    await this._refreshTokenRepository.delete({ expiresAt: LessThan(now) });
    await this._authCodeRepository.delete({ expiresAt: LessThan(now) });
  }

  public getIssuer(): string {
    return this._issuer;
  }

  public getAccessTokenTtl(): number {
    return this._accessTokenTtl;
  }

  private _signJwt(payload: JwtPayload | IdTokenPayload): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const encodedHeader = this._base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this._base64UrlEncode(JSON.stringify(payload));
    const signature = this._createSignature(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  private _verifyJwt(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = this._createSignature(
      encodedHeader,
      encodedPayload,
    );

    if (signature !== expectedSignature) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    const payload = JSON.parse(
      this._base64UrlDecode(encodedPayload),
    ) as JwtPayload;

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException(ErrorCodes.INVALID_CREDENTIALS);
    }

    return payload;
  }

  private _createSignature(
    encodedHeader: string,
    encodedPayload: string,
  ): string {
    const hmac = crypto.createHmac('sha256', this._jwtSecret);
    hmac.update(`${encodedHeader}.${encodedPayload}`);
    return this._base64UrlEncode(hmac.digest());
  }

  private _base64UrlEncode(data: string | Buffer): string {
    const buffer = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    return buffer.toString('base64url');
  }

  private _base64UrlDecode(data: string): string {
    return Buffer.from(data, 'base64url').toString('utf8');
  }

  private _generateAtHash(accessToken: string): string {
    const hash = crypto.createHash('sha256').update(accessToken).digest();
    const halfHash = hash.slice(0, hash.length / 2);
    return this._base64UrlEncode(halfHash);
  }

  private _verifyCodeChallenge(
    codeVerifier: string,
    codeChallenge: string,
    method: string,
  ): boolean {
    if (method === 'plain') {
      return codeVerifier === codeChallenge;
    }

    if (method === 'S256') {
      const hash = crypto.createHash('sha256').update(codeVerifier).digest();
      const computed = this._base64UrlEncode(hash);
      return computed === codeChallenge;
    }

    return false;
  }
}
