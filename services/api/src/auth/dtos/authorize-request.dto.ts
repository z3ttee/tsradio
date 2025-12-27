import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AuthorizeRequestDto {
  @IsString()
  @IsNotEmpty()
  public response_type: string;

  @IsString()
  @IsNotEmpty()
  public client_id: string;

  @IsString()
  @IsNotEmpty()
  public redirect_uri: string;

  @IsString()
  @IsOptional()
  public scope?: string;

  @IsString()
  @IsOptional()
  public state?: string;

  @IsString()
  @IsOptional()
  public nonce?: string;

  // PKCE support
  @IsString()
  @IsOptional()
  public code_challenge?: string;

  @IsString()
  @IsOptional()
  public code_challenge_method?: string;

  // OpenID Connect parameters
  @IsString()
  @IsOptional()
  public response_mode?: string;

  @IsString()
  @IsOptional()
  public prompt?: string;

  @IsString()
  @IsOptional()
  public login_hint?: string;
}
