import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import {
  PurchaseItemDto,
  UseShieldDto,
  ActivateBoostDto,
  ClaimChallengeDto,
  RecoverStreakDto,
} from '@repo/api';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('summary')
  getSummary(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getSummary(userId);
  }

  @Post('store/purchase')
  purchaseItem(@Body() dto: PurchaseItemDto) {
    return this.gamificationService.purchaseItem(dto);
  }

  @Post('boost/activate')
  activateBoost(@Body() dto: ActivateBoostDto) {
    return this.gamificationService.activateBoost(dto);
  }

  @Post('shields/use')
  useStreakShield(@Body() dto: UseShieldDto) {
    return this.gamificationService.useStreakShield(dto);
  }

  @Post('shields/auto-protect')
  autoProtectStreaks(@Body('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.autoProtectStreaks(userId);
  }

  @Post('streak/recover')
  recoverStreak(@Body() dto: RecoverStreakDto) {
    return this.gamificationService.recoverStreak(dto);
  }

  @Get('shields/usage')
  getShieldUsages(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getShieldUsages(userId);
  }

  @Get('inventory')
  getInventory(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getInventory(userId);
  }

  @Get('ledger')
  getLedger(
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getLedger(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 50
    );
  }

  @Get('achievements')
  getAchievements(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getAchievements(userId);
  }

  @Get('challenges')
  getChallenges(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getChallenges(userId);
  }

  @Post('challenges/claim')
  claimChallenge(@Body() dto: ClaimChallengeDto) {
    return this.gamificationService.claimChallenge(dto);
  }

  @Get('leaderboard')
  getLeaderboard(@Query('userId') userId?: string) {
    return this.gamificationService.getLeaderboard(userId);
  }

  @Get('notifications')
  getNotifications(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getNotifications(userId);
  }

  @Post('notifications/read')
  markNotificationsAsRead(@Body('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.markNotificationsAsRead(userId);
  }
}
