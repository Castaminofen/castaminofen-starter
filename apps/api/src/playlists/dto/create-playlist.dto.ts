import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreatePlaylistDto {
  @IsString()
  title: string;

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
