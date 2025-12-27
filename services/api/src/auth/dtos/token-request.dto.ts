import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
  CLIENT_CREDENTIALS = 'client_credentials',
}

export class TokenRequestDto {
  @IsEnum(GrantType)
  @IsNotEmpty()
  public grant_type: GrantType;

  @IsString()
  @IsOptional()
  public code?: string;

  @IsString()
  @IsOptional()
  public redirect_uri?: string;

  @IsString()
  @IsOptional()
  public client_id?: string;

  @IsString()
  @IsOptional()
  public client_secret?: string;

  @IsString()
  @IsOptional()
  public refresh_token?: string;

  @IsString()
  @IsOptional()
  public code_verifier?: string;

  @IsString()
  @IsOptional()
  public scope?: string;
}
