import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AddPlaylistItemDto } from './dto/add-playlist-item.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderPlaylistItemsDto } from './dto/reorder-playlist-items.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { validateReorderPayload } from './validators/playlist.validators';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreatePlaylistDto) {
    return this.prisma.playlist.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string) {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { items: true } },
      },
    });

    return playlists.map((playlist) => ({
      ...playlist,
      itemCount: playlist._count.items,
    }));
  }

  async findById(userId: string, id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { position: 'asc' },
          include: {
            episode: {
              include: {
                podcast: true,
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return {
      ...playlist,
      itemCount: playlist._count.items,
    };
  }

  async update(userId: string, id: string, data: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.playlist.update({
      where: { id },
      data,
    });
  }

  async remove(userId: string, id: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.playlist.delete({ where: { id } });
  }

  async addItem(userId: string, playlistId: string, data: AddPlaylistItemDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const episode = await this.prisma.episode.findUnique({ where: { id: data.episodeId } });
    if (!episode) {
      throw new NotFoundException('Episode not found');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingItem = await tx.playlistItem.findUnique({
          where: {
            playlistId_episodeId: {
              playlistId,
              episodeId: data.episodeId,
            },
          },
        });

        if (existingItem) {
          throw new ConflictException('Episode already exists in this playlist');
        }

        const lastItem = await tx.playlistItem.findFirst({
          where: { playlistId },
          orderBy: { position: 'desc' },
        });

        return tx.playlistItem.create({
          data: {
            playlistId,
            episodeId: data.episodeId,
            position: (lastItem?.position ?? 0) + 1,
          },
        });
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Episode already exists in this playlist');
      }

      throw error;
    }
  }

  async removeItem(userId: string, playlistId: string, episodeId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const item = await this.prisma.playlistItem.findUnique({
      where: {
        playlistId_episodeId: {
          playlistId,
          episodeId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Playlist item not found');
    }

    await this.prisma.playlistItem.delete({
      where: { id: item.id },
    });

    return { success: true };
  }

  async reorderItems(userId: string, playlistId: string, data: ReorderPlaylistItemsDto) {
    validateReorderPayload(data.items);

    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const existingItems = await this.prisma.playlistItem.findMany({
      where: { playlistId },
      select: { episodeId: true },
    });

    const existingEpisodeIds = new Set(existingItems.map((item) => item.episodeId));
    const requestedEpisodeIds = data.items.map((item) => item.episodeId);

    if (requestedEpisodeIds.length !== existingEpisodeIds.size) {
      throw new BadRequestException('Invalid reorder request');
    }

    const hasUnknownEpisode = requestedEpisodeIds.some((episodeId) => !existingEpisodeIds.has(episodeId));
    if (hasUnknownEpisode) {
      throw new BadRequestException('Invalid reorder request');
    }

    const seenEpisodeIds = new Set<string>();
    const hasDuplicateEpisode = requestedEpisodeIds.some((episodeId) => {
      if (seenEpisodeIds.has(episodeId)) {
        return true;
      }
      seenEpisodeIds.add(episodeId);
      return false;
    });

    if (hasDuplicateEpisode) {
      throw new BadRequestException('Invalid reorder request');
    }

    return this.prisma.$transaction(async (tx) => {
      await Promise.all(
        data.items.map((item) =>
          tx.playlistItem.updateMany({
            where: { playlistId, episodeId: item.episodeId },
            data: { position: item.position },
          }),
        ),
      );

      return this.findById(userId, playlistId);
    });
  }
}
