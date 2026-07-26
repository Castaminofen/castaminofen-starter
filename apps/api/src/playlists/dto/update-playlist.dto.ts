import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdatePlaylistDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
