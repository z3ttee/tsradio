import { Controller, Get } from '@nestjs/common';
import { TokenService } from '../services/token.service';

interface OpenIDConfiguration {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  jwks_uri: string;
  revocation_endpoint: string;
  introspection_endpoint: string;
  end_session_endpoint: string;
  registration_endpoint?: string;
  scopes_supported: string[];
  response_types_supported: string[];
  response_modes_supported: string[];
  grant_types_supported: string[];
  subject_types_supported: string[];
  id_token_signing_alg_values_supported: string[];
  token_endpoint_auth_methods_supported: string[];
  claims_supported: string[];
  code_challenge_methods_supported: string[];
}

interface JwksResponse {
  keys: JwkKey[];
}

interface JwkKey {
  kty: string;
  use: string;
  kid: string;
  alg: string;
  // For symmetric keys (HS256), we don't expose the actual key
  // For asymmetric keys (RS256), we would include n, e, etc.
}

@Controller('.well-known')
export class WellKnownController {
  constructor(private readonly _tokenService: TokenService) {}

  /**
   * OpenID Provider Configuration (OpenID Connect Discovery 1.0)
   * Returns information about the OpenID Provider's configuration.
   */
  @Get('openid-configuration')
  public getOpenIdConfiguration(): OpenIDConfiguration {
    const issuer = this._tokenService.getIssuer();

    return {
      issuer,
      authorization_endpoint: `${issuer}/oauth2/authorize`,
      token_endpoint: `${issuer}/oauth2/token`,
      userinfo_endpoint: `${issuer}/oauth2/userinfo`,
      jwks_uri: `${issuer}/.well-known/jwks.json`,
      revocation_endpoint: `${issuer}/oauth2/revoke`,
      introspection_endpoint: `${issuer}/oauth2/introspect`,
      end_session_endpoint: `${issuer}/oauth2/logout`,
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      response_types_supported: [
        'code',
        'token',
        'id_token',
        'code token',
        'code id_token',
        'token id_token',
        'code token id_token',
      ],
      response_modes_supported: ['query', 'fragment', 'form_post'],
      grant_types_supported: [
        'authorization_code',
        'refresh_token',
        'implicit',
      ],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['HS256'],
      token_endpoint_auth_methods_supported: [
        'client_secret_basic',
        'client_secret_post',
        'none',
      ],
      claims_supported: [
        'sub',
        'iss',
        'aud',
        'exp',
        'iat',
        'auth_time',
        'nonce',
        'at_hash',
        'name',
        'preferred_username',
        'email',
        'email_verified',
        'updated_at',
      ],
      code_challenge_methods_supported: ['plain', 'S256'],
    };
  }

  /**
   * JSON Web Key Set (RFC 7517)
   * Returns the public keys used to verify tokens.
   * Note: For HS256 (symmetric), we don't expose keys.
   * In production with RS256, you would return the public keys here.
   */
  @Get('jwks.json')
  public getJwks(): JwksResponse {
    // For HS256, we use a symmetric key that shouldn't be exposed
    // This endpoint would be more useful with RS256/RS384/RS512
    // where we can expose public keys for token verification
    return {
      keys: [
        {
          kty: 'oct',
          use: 'sig',
          kid: 'default-key',
          alg: 'HS256',
          // Note: 'k' (the actual key) is intentionally not included
          // for security reasons with symmetric keys
        },
      ],
    };
  }
}
