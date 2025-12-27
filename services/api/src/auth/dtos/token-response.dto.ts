export class TokenResponseDto {
  public access_token: string;
  public token_type: string;
  public expires_in: number;
  public refresh_token?: string;
  public id_token?: string;
}
