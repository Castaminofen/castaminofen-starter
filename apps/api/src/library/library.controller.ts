import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { LibraryService } from './library.service';
import { UpdateListeningHistoryDto } from './dto/update-listening-history.dto';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/library')
export class LibraryController {
  constructor(private libraryService: LibraryService) {}

  @Get()
  async getOverview(@GetUser('id') userId: string) {
    const subscriptions = await this.libraryService.getSubscriptions(userId);
    const continueListening = await this.libraryService.getContinueListening(userId);
    return { subscriptions, continueListening };
  }

  @Get('subscriptions')
  async listSubscriptions(@GetUser('id') userId: string) {
    return this.libraryService.getSubscriptions(userId);
  }

  @Post('subscriptions/:podcastId')
  async subscribe(@GetUser('id') userId: string, @Param('podcastId') podcastId: string) {
    return this.libraryService.subscribe(userId, podcastId);
  }

  @Delete('subscriptions/:podcastId')
  async unsubscribe(@GetUser('id') userId: string, @Param('podcastId') podcastId: string) {
    return this.libraryService.unsubscribe(userId, podcastId);
  }

  @Get('continue-listening')
  async continueListening(@GetUser('id') userId: string) {
    return this.libraryService.getContinueListening(userId);
  }

  @Patch('history/:episodeId')
  async updateHistory(
    @GetUser('id') userId: string,
    @Param('episodeId') episodeId: string,
    @Body() dto: UpdateListeningHistoryDto,
  ) {
    return this.libraryService.updateListeningProgress(userId, episodeId, dto);
  }
}
