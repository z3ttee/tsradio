export class TokenResponseDto {
  public access_token: string;
  public token_type: string;
  public expires_in: number;
  public refresh_token?: string;
  public scope?: string;
  public id_token?: string;
}

export class TokenErrorResponseDto {
  public error: string;
  public error_description?: string;
  public error_uri?: string;
}
