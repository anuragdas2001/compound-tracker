import { Controller, Get, Query } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('summary')
  getSummary(@Query('userId') userId?: string) {
    const id = userId || '68595c0f4d4d3dbd7b2b7f5a'; // Using hardcoded fallback based on habits.controller.ts
    return this.gamificationService.getSummary(id);
  }
}
