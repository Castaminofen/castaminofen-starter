import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { PlaylistsService } from './playlists.service';

@UseGuards(JwtAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.playlistsService.findAll(userId);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.playlistsService.findById(userId, id);
  }

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreatePlaylistDto) {
    return this.playlistsService.create(userId, dto);
  }

  @Patch(':id')
  update(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdatePlaylistDto) {
    return this.playlistsService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.playlistsService.remove(userId, id);
  }

  @Post(':id/items')
  addItem(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: AddPlaylistItemDto) {
    return this.playlistsService.addItem(userId, id, dto);
  }

  @Delete(':id/items/:episodeId')
  removeItem(@GetUser('id') userId: string, @Param('id') id: string, @Param('episodeId') episodeId: string) {
    return this.playlistsService.removeItem(userId, id, episodeId);
  }

  @Patch(':id/items/reorder')
  reorderItems(@GetUser('id') userId: string, @Param('id') id: string, @Body() dto: ReorderPlaylistItemsDto) {
    return this.playlistsService.reorderItems(userId, id, dto);
  }
}
