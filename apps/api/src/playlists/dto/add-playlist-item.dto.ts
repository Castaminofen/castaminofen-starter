import { IsString } from 'class-validator';

export class AddPlaylistItemDto {
  @IsString()
  episodeId: string;
}
