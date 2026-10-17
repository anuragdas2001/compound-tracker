import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseItemDto, UseShieldDto } from '@repo/api';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly REWARDS = {
    HABIT_COMPLETION_XP: 10,
    HABIT_COMPLETION_SPARKS: 5,
  };

  /**
   * Calculate player level from cumulative XP.
   * Progression formula: Level = floor(1 + sqrt(totalXp / 100))
   */
  calculateLevel(totalXp: number): number {
    return Math.max(1, Math.floor(1 + Math.sqrt(Math.max(0, totalXp) / 100)));
  }

  async getSummary(userId: string) {
    let summary = await this.prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!summary) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return { totalXp: 0, level: 1, sparksBalance: 150, shields: 0, unreadNotifications: 0 };
      }

      summary = await this.prisma.userGamification.create({
        data: {
          userId,
          totalXp: 0,
          level: 1,
          sparksBalance: 150,
        },
      });
    }

    const shields = await this.prisma.powerUpInventory.findUnique({
      where: { userId_powerUpType: { userId, powerUpType: 'STREAK_SHIELD' } },
    });

    const unreadNotifications = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    return {
      ...summary,
      shields: shields?.quantity || 0,
      unreadNotifications,
    };
  }

  /**
   * Idempotently awards XP and Sparks when a habit is completed.
   */
  async awardHabitCompletion(userId: string, habitId: string, logId: string) {
    const idempotencyKey = `log_${logId}`;

    const existing = await this.prisma.gamificationLedger.findFirst({
      where: { userId, sourceId: idempotencyKey, type: 'EARN' },
    });
    if (existing) return;

    let current = await this.prisma.userGamification.findUnique({ where: { userId } });
    if (!current) {
      current = await this.prisma.userGamification.create({
        data: { userId, totalXp: 0, level: 1, sparksBalance: 150 },
      });
    }

    const newXp = current.totalXp + this.REWARDS.HABIT_COMPLETION_XP;
    const newLevel = this.calculateLevel(newXp);
    const sparksGained = this.REWARDS.HABIT_COMPLETION_SPARKS;

    await this.prisma.$transaction([
      this.prisma.userGamification.update({
        where: { userId },
        data: {
          totalXp: newXp,
          level: newLevel,
          sparksBalance: { increment: sparksGained },
        },
      }),
      this.prisma.gamificationLedger.create({
        data: {
          userId,
          type: 'EARN',
          amount: sparksGained,
          sourceType: 'HABIT_COMPLETION',
          sourceId: idempotencyKey,
          metadata: { habitId, xpGained: this.REWARDS.HABIT_COMPLETION_XP },
        },
      }),
    ]);
  }

  /**
   * Reverses rewards if a habit completion is undone.
   */
  async revokeHabitCompletion(userId: string, habitId: string, logId: string) {
    const earnKey = `log_${logId}`;
    const revokeKey = `revoke_log_${logId}`;

    const earned = await this.prisma.gamificationLedger.findFirst({
      where: { userId, sourceId: earnKey, type: 'EARN' },
    });
    if (!earned) return;

    const alreadyRevoked = await this.prisma.gamificationLedger.findFirst({
      where: { userId, sourceId: revokeKey, type: 'REVOKE' },
    });
    if (alreadyRevoked) return;

    const current = await this.prisma.userGamification.findUnique({ where: { userId } });
    if (!current) return;

    const newXp = Math.max(0, current.totalXp - this.REWARDS.HABIT_COMPLETION_XP);
    const newLevel = this.calculateLevel(newXp);
    const sparksDeducted = Math.min(current.sparksBalance, this.REWARDS.HABIT_COMPLETION_SPARKS);

    await this.prisma.$transaction([
      this.prisma.userGamification.update({
        where: { userId },
        data: {
          totalXp: newXp,
          level: newLevel,
          sparksBalance: { decrement: sparksDeducted },
        },
      }),
      this.prisma.gamificationLedger.create({
        data: {
          userId,
          type: 'REVOKE',
          amount: sparksDeducted,
          sourceType: 'HABIT_UNCOMPLETION',
          sourceId: revokeKey,
          metadata: { habitId, xpLost: this.REWARDS.HABIT_COMPLETION_XP },
        },
      }),
    ]);
  }

  /**
   * Purchases a store item (e.g., Streak Shield or Theme) using Sparks balance.
   */
  async purchaseItem(dto: PurchaseItemDto) {
    const { userId, itemType, cost } = dto;

    const profile = await this.prisma.userGamification.findUnique({ where: { userId } });
    if (!profile || profile.sparksBalance < cost) {
      throw new BadRequestException('Insufficient Sparks balance to complete this purchase.');
    }

    const timestamp = Date.now();
    const purchaseId = `purchase_${itemType}_${timestamp}`;

    await this.prisma.$transaction([
      this.prisma.userGamification.update({
        where: { userId },
        data: { sparksBalance: { decrement: cost } },
      }),
      this.prisma.powerUpInventory.upsert({
        where: { userId_powerUpType: { userId, powerUpType: itemType } },
        create: { userId, powerUpType: itemType, quantity: 1 },
        update: { quantity: { increment: 1 } },
      }),
      this.prisma.gamificationLedger.create({
        data: {
          userId,
          type: 'SPEND',
          amount: cost,
          sourceType: 'STORE_PURCHASE',
          sourceId: purchaseId,
          metadata: { itemType },
        },
      }),
    ]);

    const updated = await this.getSummary(userId);
    return {
      success: true,
      message: `Purchased ${itemType} for ${cost} Sparks!`,
      summary: updated,
    };
  }

  /**
   * Consumes a Streak Shield to protect a missed scheduled day from breaking a streak.
   */
  async useStreakShield(dto: UseShieldDto) {
    const { userId, habitId, missedDate } = dto;

    const inventory = await this.prisma.powerUpInventory.findUnique({
      where: { userId_powerUpType: { userId, powerUpType: 'STREAK_SHIELD' } },
    });

    if (!inventory || inventory.quantity <= 0) {
      throw new BadRequestException('You do not have any Streak Shields available.');
    }

    const targetDate = new Date(missedDate);
    targetDate.setHours(12, 0, 0, 0);
    const dateStr = targetDate.toISOString().split('T')[0];
    const idempotencyKey = `shield_${userId}_${habitId || 'account'}_${dateStr}`;

    const alreadyUsed = await this.prisma.powerUpUsage.findUnique({
      where: { idempotencyKey },
    });
    if (alreadyUsed) {
      throw new BadRequestException('This date is already protected by a Streak Shield.');
    }

    await this.prisma.$transaction([
      this.prisma.powerUpInventory.update({
        where: { userId_powerUpType: { userId, powerUpType: 'STREAK_SHIELD' } },
        data: { quantity: { decrement: 1 } },
      }),
      this.prisma.powerUpUsage.create({
        data: {
          userId,
          powerUpType: 'STREAK_SHIELD',
          relatedHabitId: habitId || null,
          missedDate: targetDate,
          idempotencyKey,
        },
      }),
      this.prisma.gamificationLedger.create({
        data: {
          userId,
          type: 'CONSUME',
          amount: 1,
          sourceType: 'POWER_UP_USAGE',
          sourceId: idempotencyKey,
          metadata: { habitId, missedDate: dateStr },
        },
      }),
      this.prisma.notification.create({
        data: {
          userId,
          type: 'SHIELD_USED',
          title: 'Streak Shield Activated',
          body: `Your streak for ${dateStr} has been protected!`,
        },
      }),
    ]);

    const updated = await this.getSummary(userId);
    return {
      success: true,
      message: 'Streak Shield successfully activated! Your streak is protected.',
      summary: updated,
    };
  }

  /**
   * Gets all streak shields used by a user to keep track of protected days.
   */
  async getShieldUsages(userId: string) {
    return this.prisma.powerUpUsage.findMany({
      where: { userId, powerUpType: 'STREAK_SHIELD' },
      orderBy: { missedDate: 'desc' },
    });
  }
}
