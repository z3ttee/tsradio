import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthorizeRequestDto, UserinfoResponseDto } from '../dtos';
import type { AuthenticatedRequest } from '../guards/jwt-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('oauth2')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  /**
   * Authorization Endpoint (RFC 6749 Section 3.1)
   * This endpoint is used to interact with the resource owner and obtain
   * an authorization grant.
   */
  @Get('authorize')
  public authorize(
    @Query() query: AuthorizeRequestDto,
    @Res() res: Response,
  ): void {
    // Validate response_type
    if (query.response_type !== 'code' && query.response_type !== 'token') {
      throw new BadRequestException('unsupported_response_type');
    }

    // In a real implementation, you would:
    // 1. Verify the client_id is valid
    // 2. Verify the redirect_uri is registered for this client
    // 3. Show a login page if the user is not authenticated
    // 4. Show a consent page to authorize the requested scopes
    // 5. Generate and return the authorization code or token

    // For now, we'll redirect to a login page with the authorization parameters
    const params = new URLSearchParams({
      response_type: query.response_type,
      client_id: query.client_id,
      redirect_uri: query.redirect_uri,
      scope: query.scope || 'openid',
      state: query.state || '',
    });

    if (query.code_challenge) {
      params.append('code_challenge', query.code_challenge);
      params.append(
        'code_challenge_method',
        query.code_challenge_method || 'plain',
      );
    }

    if (query.nonce) {
      params.append('nonce', query.nonce);
    }

    // Redirect to login page
    res.redirect(`/login?${params.toString()}`);
  }

  /**
   * Authorization Callback - handles form submission after user authentication
   * In production, this would be called after successful login
   */
  @Post('authorize')
  @HttpCode(HttpStatus.FOUND)
  public async authorizeCallback(
    @Body() body: AuthorizeRequestDto & { user_id: string },
    @Res() res: Response,
  ): Promise<void> {
    const scopes = body.scope?.split(' ') || ['openid'];

    if (body.response_type === 'code') {
      const code = await this._authService.generateAuthorizationCode(
        body.user_id,
        body.client_id,
        body.redirect_uri,
        scopes,
        body.code_challenge,
        body.code_challenge_method,
        body.nonce,
      );

      const redirectUrl = new URL(body.redirect_uri);
      redirectUrl.searchParams.set('code', code);
      if (body.state) {
        redirectUrl.searchParams.set('state', body.state);
      }

      res.redirect(redirectUrl.toString());
      return;
    }

    throw new BadRequestException('unsupported_response_type');
  }

  /**
   * Userinfo Endpoint (OpenID Connect Core Section 5.3)
   * Returns claims about the authenticated end-user.
   */
  @Get('userinfo')
  @UseGuards(JwtAuthGuard)
  public async getUserinfo(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserinfoResponseDto> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('invalid_token');
    }
    return this._authService.getUserinfo(token);
  }

  @Post('userinfo')
  @UseGuards(JwtAuthGuard)
  public async postUserinfo(
    @Req() req: AuthenticatedRequest,
  ): Promise<UserinfoResponseDto> {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new BadRequestException('invalid_token');
    }
    return this._authService.getUserinfo(token);
  }

  /**
   * Revocation Endpoint (RFC 7009)
   * Allows clients to notify the authorization server that a previously
   * obtained token is no longer needed.
   */
  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  public async revoke(
    @Body() body: { token: string; token_type_hint?: string },
  ): Promise<void> {
    await this._authService.revokeToken(body.token, body.token_type_hint);
  }

  /**
   * Introspection Endpoint (RFC 7662)
   * Allows resource servers to query the authorization server to determine
   * the active state of an access token.
   */
  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  public async introspect(
    @Body() body: { token: string; token_type_hint?: string },
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
    return this._authService.introspectToken(body.token, body.token_type_hint);
  }

  /**
   * End Session Endpoint (OpenID Connect Session Management)
   * Allows users to log out from the authorization server.
   */
  @Get('logout')
  public logout(
    @Query('id_token_hint') idTokenHint: string,
    @Query('post_logout_redirect_uri') postLogoutRedirectUri: string,
    @Query('state') state: string,
    @Res() res: Response,
  ): void {
    // In production, you would validate the id_token_hint and
    // verify the post_logout_redirect_uri is registered

    if (postLogoutRedirectUri) {
      const redirectUrl = new URL(postLogoutRedirectUri);
      if (state) {
        redirectUrl.searchParams.set('state', state);
      }
      res.redirect(redirectUrl.toString());
      return;
    }

    res.status(HttpStatus.OK).send('Logged out successfully');
  }
}
