import { Controller, Get, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { PurchaseItemDto, UseShieldDto } from '@repo/api';

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

  @Post('shields/use')
  useStreakShield(@Body() dto: UseShieldDto) {
    return this.gamificationService.useStreakShield(dto);
  }

  @Get('shields/usage')
  getShieldUsages(@Query('userId') userId?: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    return this.gamificationService.getShieldUsages(userId);
  }
}
