import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum GrantType {
  AUTHORIZATION_CODE = 'authorization_code',
  REFRESH_TOKEN = 'refresh_token',
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
  public refresh_token?: string;
}
