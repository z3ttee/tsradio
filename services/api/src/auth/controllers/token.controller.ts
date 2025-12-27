import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Header,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { TokenRequestDto, TokenResponseDto } from '../dtos';

@Controller('oauth2')
export class TokenController {
  constructor(private readonly _authService: AuthService) {}

  /**
   * Token Endpoint (RFC 6749 Section 3.2)
   * The token endpoint is used by the client to obtain an access token
   * by presenting its authorization grant or refresh token.
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
}
