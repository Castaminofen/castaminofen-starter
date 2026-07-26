import { Module } from '@nestjs/common';
import { LibraryService } from './library.service';
import { LibraryController } from './library.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PodcastsModule } from '../podcasts/podcasts.module';
import { EpisodesModule } from '../episodes/episodes.module';

@Module({
  imports: [PrismaModule, PodcastsModule, EpisodesModule],
  providers: [LibraryService],
  controllers: [LibraryController],
})
export class LibraryModule {}
