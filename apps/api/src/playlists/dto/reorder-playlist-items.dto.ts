import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class PlaylistReorderItemDto {
  @IsString()
  episodeId: string;

  @IsInt()
  @Min(1)
  position: number;
}

export class ReorderPlaylistItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistReorderItemDto)
  items: PlaylistReorderItemDto[];
}
