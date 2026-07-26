import { IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateListeningHistoryDto {
  @IsOptional()
  @IsInt()
  positionSeconds?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
