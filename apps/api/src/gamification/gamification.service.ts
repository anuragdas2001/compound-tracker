import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  PurchaseItemDto,
  UseShieldDto,
  ActivateBoostDto,
  ClaimChallengeDto,
  RecoverStreakDto,
} from '@repo/api';

export const SYSTEM_ACHIEVEMENTS = [
  {
    key: 'FIRST_HABIT',
    title: 'Bronze Pioneer',
    description: 'Complete your first habit in the platform.',
    category: 'Milestones',
    rarity: 'Common',
    xpReward: 50,
    sparksReward: 25,
    icon: 'Trophy',
    color: '#CD7F32',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.totalLogs >= 1,
    getProgress: (s: { totalLogs: number }) => `${Math.min(1, s.totalLogs)} / 1`,
  },
  {
    key: 'STREAK_7',
    title: 'Silver Streak',
    description: 'Maintain a 7-day streak on any habit.',
    category: 'Streaks',
    rarity: 'Uncommon',
    xpReward: 100,
    sparksReward: 50,
    icon: 'Medal',
    color: '#C0C0C0',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.maxStreak >= 7,
    getProgress: (s: { maxStreak: number }) => `${Math.min(7, s.maxStreak)} / 7 days`,
  },
  {
    key: 'STREAK_30',
    title: 'Gold Standard',
    description: 'Reach a 30-day streak of compounding habits.',
    category: 'Streaks',
    rarity: 'Rare',
    xpReward: 250,
    sparksReward: 100,
    icon: 'Trophy',
    color: '#FFD700',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.maxStreak >= 30,
    getProgress: (s: { maxStreak: number }) => `${Math.min(30, s.maxStreak)} / 30 days`,
  },
  {
    key: 'CENTURION_100',
    title: 'Centurion Master',
    description: 'Log 100 total habit check-ins in your journey.',
    category: 'Volume',
    rarity: 'Epic',
    xpReward: 500,
    sparksReward: 250,
    icon: 'Star',
    color: '#A855F7',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.totalLogs >= 100,
    getProgress: (s: { totalLogs: number }) => `${Math.min(100, s.totalLogs)} / 100`,
  },
  {
    key: 'LEVEL_5',
    title: 'Ascending Habitier',
    description: 'Advance your player progression to Level 5.',
    category: 'Level',
    rarity: 'Uncommon',
    xpReward: 100,
    sparksReward: 50,
    icon: 'Zap',
    color: '#3B82F6',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.level >= 5,
    getProgress: (s: { level: number }) => `${Math.min(5, s.level)} / 5`,
  },
  {
    key: 'LEVEL_10',
    title: 'Elite Architect',
    description: 'Reach Level 10 through relentless discipline.',
    category: 'Level',
    rarity: 'Legendary',
    xpReward: 500,
    sparksReward: 250,
    icon: 'Crown',
    color: '#EC4899',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.level >= 10,
    getProgress: (s: { level: number }) => `${Math.min(10, s.level)} / 10`,
  },
  {
    key: 'SHIELD_PROTECTOR',
    title: 'Aegis Defender',
    description: 'Protect a habit streak using a Streak Shield or Freeze.',
    category: 'Shields',
    rarity: 'Common',
    xpReward: 50,
    sparksReward: 25,
    icon: 'Shield',
    color: '#38BDF8',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.shieldsUsed >= 1,
    getProgress: (s: { shieldsUsed: number }) => `${Math.min(1, s.shieldsUsed)} / 1`,
  },
  {
    key: 'STREAK_100',
    title: 'Diamond Legacy',
    description: 'Achieve a legendary 100-day streak.',
    category: 'Streaks',
    rarity: 'Mythic',
    xpReward: 1500,
    sparksReward: 1000,
    icon: 'Sparkles',
    color: '#06B6D4',
    check: (s: { totalLogs: number; maxStreak: number; level: number; shieldsUsed: number }) => s.maxStreak >= 100,
    getProgress: (s: { maxStreak: number }) => `${Math.min(100, s.maxStreak)} / 100 days`,
  },
];

export const SYSTEM_CHALLENGES = [
  {
    key: 'SPRINT_7',
    title: '7-Day Momentum Sprint',
    description: 'Complete all scheduled habits for 7 consecutive days without breaking your chain.',
    target: 7,
    sparksReward: 500,
    xpReward: 200,
    duration: '7 Days',
    difficulty: 'Medium',
    icon: 'Flame',
    color: '#F59E0B',
    calcProgress: (stats: { maxStreak: number; totalLogs: number }) => Math.min(7, stats.maxStreak),
  },
  {
    key: 'CONSISTENCY_30',
    title: '30-Day Consistency Challenge',
    description: 'Build an unbroken streak of at least 30 consecutive compounding days.',
    target: 30,
    sparksReward: 1500,
    xpReward: 750,
    duration: '30 Days',
    difficulty: 'Hard',
    icon: 'Shield',
    color: '#3B82F6',
    calcProgress: (stats: { maxStreak: number; totalLogs: number }) => Math.min(30, stats.maxStreak),
  },
  {
    key: 'CENTURION_100',
    title: 'Centurion Milestone',
    description: 'Log 100 total habit completion sessions across your active routines.',
    target: 100,
    sparksReward: 1000,
    xpReward: 500,
    duration: '100 Sessions',
    difficulty: 'Hard',
    icon: 'Target',
    color: '#EC4899',
    calcProgress: (stats: { maxStreak: number; totalLogs: number }) => Math.min(100, stats.totalLogs),
  },
  {
    key: 'COMMUNITY_COLLECTIVE',
    title: 'Global Community Momentum',
    description: 'Contribute to the collective Compound community goal of 50 total habits completed.',
    target: 50,
    sparksReward: 750,
    xpReward: 350,
    duration: 'Community Quest',
    difficulty: 'Legendary',
    icon: 'Users',
    color: '#10B981',
    calcProgress: (stats: { maxStreak: number; totalLogs: number }) => Math.min(50, stats.totalLogs),
  },
];

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly REWARDS = {
    HABIT_COMPLETION_XP: 10,
    HABIT_COMPLETION_SPARKS: 5,
  };

  private readonly STREAK_MILESTONES = [
    { days: 7, xp: 50, sparks: 25 },
    { days: 14, xp: 100, sparks: 50 },
    { days: 30, xp: 250, sparks: 100 },
    { days: 50, xp: 400, sparks: 200 },
    { days: 100, xp: 1000, sparks: 500 },
    { days: 365, xp: 3650, sparks: 2000 },
  ];

  calculateLevel(totalXp: number): number {
    return Math.max(1, Math.floor(1 + Math.sqrt(Math.max(0, totalXp) / 100)));
  }

  calculateStreakForHabit(
    logs: { completedAt: Date; value?: number }[],
    shields: { missedDate: Date | null; relatedHabitId?: string | null }[],
    habitId: string,
    mode: string = 'daily',
    days: number[] = [],
    perWeek: number = 3,
    target: number = 1
  ): number {
    const isDateActive = (d: Date): boolean => {
      const year = d.getFullYear();
      const month = d.getMonth();
      const date = d.getDate();
      const start = new Date(year, month, date, 0, 0, 0, 0);
      const end = new Date(year, month, date, 23, 59, 59, 999);

      const hasLog = logs.some((l) => {
        const ld = new Date(l.completedAt);
        return ld >= start && ld <= end && (l.value ?? 1) >= target;
      });
      if (hasLog) return true;

      const hasShield = shields.some((s) => {
        if (!s.missedDate) return false;
        if (s.relatedHabitId && s.relatedHabitId !== habitId) return false;
        const sd = new Date(s.missedDate);
        return sd >= start && sd <= end;
      });
      return hasShield;
    };

    if (mode === 'flex') {
      const baseMonday = (offsetWeeks: number): Date => {
        const now = new Date();
        const day = now.getDay();
        const diff = (day === 0 ? -6 : 1) - day;
        const mon = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
        mon.setHours(0, 0, 0, 0);
        mon.setDate(mon.getDate() + offsetWeeks * 7);
        return mon;
      };

      let weeksStreak = 0;
      let thisWeekCount = 0;
      const mondayThisWeek = baseMonday(0);
      for (let i = 0; i < 7; i++) {
        const d = new Date(mondayThisWeek);
        d.setDate(mondayThisWeek.getDate() + i);
        if (isDateActive(d)) thisWeekCount++;
      }
      if (thisWeekCount >= perWeek) weeksStreak++;

      for (let w = 1; w < 52; w++) {
        let count = 0;
        const mon = baseMonday(-w);
        for (let i = 0; i < 7; i++) {
          const d = new Date(mon);
          d.setDate(mon.getDate() + i);
          if (isDateActive(d)) count++;
        }
        if (count >= perWeek) weeksStreak++;
        else break;
      }
      return weeksStreak;
    }

    if (mode === 'days' && Array.isArray(days) && days.length > 0) {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      const todayDayIndex = (d.getDay() + 6) % 7;
      if (days.includes(todayDayIndex) && !isDateActive(d)) {
        d.setDate(d.getDate() - 1);
      } else if (!days.includes(todayDayIndex)) {
        d.setDate(d.getDate() - 1);
      }

      let n = 0;
      let safety = 0;
      while (safety < 366) {
        safety++;
        const dayIdx = (d.getDay() + 6) % 7;
        if (days.includes(dayIdx)) {
          if (isDateActive(d)) n++;
          else break;
        }
        d.setDate(d.getDate() - 1);
      }
      return n;
    }

    // Daily mode
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (!isDateActive(d)) d.setDate(d.getDate() - 1);

    let n = 0;
    while (isDateActive(d) && n < 366) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  }

  async getSummary(userId: string) {
    let summary = await this.prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!summary) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return {
          totalXp: 0,
          level: 1,
          sparksBalance: 150,
          shields: 0,
          unreadNotifications: 0,
          isBoostActive: false,
          boostMultiplier: 1,
          boostExpiresAt: null,
        };
      }

      summary = await this.prisma.userGamification.create({
        data: {
          userId,
          totalXp: 0,
          level: 1,
          sparksBalance: 150,
          boostMultiplier: 1,
          boostExpiresAt: null,
        },
      });
    }

    const shields = await this.prisma.powerUpInventory.findUnique({
      where: { userId_powerUpType: { userId, powerUpType: 'STREAK_SHIELD' } },
    });

    const unreadNotifications = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });

    const now = new Date();
    const isBoostActive = Boolean(summary.boostExpiresAt && new Date(summary.boostExpiresAt) > now);

    return {
      ...summary,
      shields: shields?.quantity || 0,
      unreadNotifications,
      isBoostActive,
      boostMultiplier: isBoostActive ? summary.boostMultiplier : 1,
    };
  }

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

    const now = new Date();
    const isBoostActive = Boolean(current.boostExpiresAt && new Date(current.boostExpiresAt) > now);
    const multiplier = isBoostActive ? (current.boostMultiplier || 2) : 1;
    const baseHabitXp = this.REWARDS.HABIT_COMPLETION_XP;
    const finalHabitXp = baseHabitXp * multiplier;
    const sparksGained = this.REWARDS.HABIT_COMPLETION_SPARKS;

    const newXp = current.totalXp + finalHabitXp;
    const newLevel = this.calculateLevel(newXp);

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
          sourceType: isBoostActive ? 'HABIT_COMPLETION_BOOSTED' : 'HABIT_COMPLETION',
          sourceId: idempotencyKey,
          metadata: { habitId, xpGained: finalHabitXp, multiplier },
        },
      }),
    ]);

    if (newLevel > current.level) {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'LEVEL_UP',
          title: `Level Up! Reached Level ${newLevel}`,
          body: `Congratulations! Your daily compounding effort elevated you to Player Level ${newLevel}!`,
        },
      });
    }

    // Evaluate streak milestones
    await this.evaluateStreakMilestones(userId, habitId);

    // Evaluate achievements
    await this.checkAndUnlockAchievements(userId);

    // Update challenges progress
    await this.updateChallengesProgress(userId);
  }

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

    const meta = earned.metadata as any;
    const xpToDeduct = meta?.xpGained || this.REWARDS.HABIT_COMPLETION_XP;
    const sparksDeducted = Math.min(current.sparksBalance, earned.amount || this.REWARDS.HABIT_COMPLETION_SPARKS);
    const newXp = Math.max(0, current.totalXp - xpToDeduct);
    const newLevel = this.calculateLevel(newXp);

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
          metadata: { habitId, xpLost: xpToDeduct },
        },
      }),
    ]);
  }

  async evaluateStreakMilestones(userId: string, habitId: string) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      include: {
        logs: { orderBy: { completedAt: 'desc' } },
      },
    });
    if (!habit) return;

    const shields = await this.prisma.powerUpUsage.findMany({
      where: { userId },
    });

    const streak = this.calculateStreakForHabit(
      habit.logs,
      shields,
      habitId,
      habit.mode,
      habit.days,
      habit.perWeek,
      habit.target
    );

    for (const milestone of this.STREAK_MILESTONES) {
      if (streak >= milestone.days) {
        const milestoneKey = `milestone_${userId}_${habitId}_${milestone.days}`;
        const alreadyAwarded = await this.prisma.gamificationLedger.findFirst({
          where: { userId, sourceId: milestoneKey },
        });

        if (!alreadyAwarded) {
          const profile = await this.prisma.userGamification.findUnique({ where: { userId } });
          const updatedXp = (profile?.totalXp || 0) + milestone.xp;
          const updatedLevel = this.calculateLevel(updatedXp);

          await this.prisma.$transaction([
            this.prisma.userGamification.update({
              where: { userId },
              data: {
                totalXp: updatedXp,
                level: updatedLevel,
                sparksBalance: { increment: milestone.sparks },
              },
            }),
            this.prisma.gamificationLedger.create({
              data: {
                userId,
                type: 'EARN',
                amount: milestone.sparks,
                sourceType: 'STREAK_MILESTONE',
                sourceId: milestoneKey,
                metadata: {
                  habitId,
                  milestoneDays: milestone.days,
                  xpGained: milestone.xp,
                  habitTitle: habit.title,
                },
              },
            }),
            this.prisma.notification.create({
              data: {
                userId,
                type: 'STREAK_MILESTONE',
                title: `${milestone.days}-Day Streak Milestone! 🔥`,
                body: `Incredible dedication! You reached a ${milestone.days}-day streak on "${habit.title}". +${milestone.xp} XP & +${milestone.sparks} Sparks awarded!`,
              },
            }),
          ]);
        }
      }
    }
  }

  async checkAndUnlockAchievements(userId: string) {
    const userHabits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });

    const shields = await this.prisma.powerUpUsage.findMany({
      where: { userId },
    });

    const totalLogs = userHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
    let maxStreak = 0;
    for (const h of userHabits) {
      const s = this.calculateStreakForHabit(
        h.logs,
        shields,
        h.id,
        h.mode,
        h.days,
        h.perWeek,
        h.target
      );
      if (s > maxStreak) maxStreak = s;
    }

    const summary = await this.prisma.userGamification.findUnique({ where: { userId } });
    const level = summary?.level || 1;
    const shieldsUsed = shields.length;

    const stats = { totalLogs, maxStreak, level, shieldsUsed };

    for (const ach of SYSTEM_ACHIEVEMENTS) {
      if (ach.check(stats)) {
        const existing = await this.prisma.userAchievement.findUnique({
          where: { userId_achievementKey: { userId, achievementKey: ach.key } },
        });

        if (!existing) {
          const currentProfile = await this.prisma.userGamification.findUnique({ where: { userId } });
          const newXp = (currentProfile?.totalXp || 0) + ach.xpReward;
          const newLevel = this.calculateLevel(newXp);

          await this.prisma.$transaction([
            this.prisma.userAchievement.create({
              data: {
                userId,
                achievementKey: ach.key,
                title: ach.title,
                description: ach.description,
                xpReward: ach.xpReward,
                sparksReward: ach.sparksReward,
              },
            }),
            this.prisma.userGamification.update({
              where: { userId },
              data: {
                totalXp: newXp,
                level: newLevel,
                sparksBalance: { increment: ach.sparksReward },
              },
            }),
            this.prisma.gamificationLedger.create({
              data: {
                userId,
                type: 'EARN',
                amount: ach.sparksReward,
                sourceType: 'ACHIEVEMENT_UNLOCK',
                sourceId: `achievement_${userId}_${ach.key}`,
                metadata: {
                  achievementKey: ach.key,
                  achievementTitle: ach.title,
                  xpGained: ach.xpReward,
                },
              },
            }),
            this.prisma.notification.create({
              data: {
                userId,
                type: 'ACHIEVEMENT_UNLOCKED',
                title: `Achievement Unlocked: ${ach.title}! 🏆`,
                body: `You unlocked "${ach.title}" — ${ach.description}! +${ach.xpReward} XP & +${ach.sparksReward} Sparks claimed!`,
              },
            }),
          ]);
        }
      }
    }
  }

  async getAchievements(userId: string) {
    const unlocked = await this.prisma.userAchievement.findMany({
      where: { userId },
    });
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementKey, u]));

    const userHabits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });
    const shields = await this.prisma.powerUpUsage.findMany({ where: { userId } });
    const totalLogs = userHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
    let maxStreak = 0;
    for (const h of userHabits) {
      const s = this.calculateStreakForHabit(h.logs, shields, h.id, h.mode, h.days, h.perWeek, h.target);
      if (s > maxStreak) maxStreak = s;
    }
    const summary = await this.prisma.userGamification.findUnique({ where: { userId } });
    const level = summary?.level || 1;
    const shieldsUsed = shields.length;
    const stats = { totalLogs, maxStreak, level, shieldsUsed };

    return SYSTEM_ACHIEVEMENTS.map((ach) => {
      const u = unlockedMap.get(ach.key);
      const isUnlocked = Boolean(u);
      return {
        key: ach.key,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        rarity: ach.rarity,
        icon: ach.icon,
        color: ach.color,
        xpReward: ach.xpReward,
        sparksReward: ach.sparksReward,
        isUnlocked,
        unlockedAt: u ? u.unlockedAt.toISOString() : null,
        progress: ach.getProgress(stats),
      };
    });
  }

  async updateChallengesProgress(userId: string) {
    const userHabits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });
    const shields = await this.prisma.powerUpUsage.findMany({ where: { userId } });
    const totalLogs = userHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
    let maxStreak = 0;
    for (const h of userHabits) {
      const s = this.calculateStreakForHabit(h.logs, shields, h.id, h.mode, h.days, h.perWeek, h.target);
      if (s > maxStreak) maxStreak = s;
    }
    const stats = { maxStreak, totalLogs };

    for (const ch of SYSTEM_CHALLENGES) {
      const progress = ch.calcProgress(stats);
      const isCompleted = progress >= ch.target;

      await this.prisma.userChallenge.upsert({
        where: { userId_challengeKey: { userId, challengeKey: ch.key } },
        create: {
          userId,
          challengeKey: ch.key,
          title: ch.title,
          progress,
          target: ch.target,
          sparksReward: ch.sparksReward,
          xpReward: ch.xpReward,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        update: {
          progress,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined,
        },
      });
    }
  }

  async getChallenges(userId: string) {
    const userHabits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });
    const shields = await this.prisma.powerUpUsage.findMany({ where: { userId } });
    const totalLogs = userHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
    let maxStreak = 0;
    for (const h of userHabits) {
      const s = this.calculateStreakForHabit(h.logs, shields, h.id, h.mode, h.days, h.perWeek, h.target);
      if (s > maxStreak) maxStreak = s;
    }
    const stats = { maxStreak, totalLogs };

    const claimed = await this.prisma.userChallenge.findMany({
      where: { userId },
    });
    const claimedMap = new Map(claimed.map((c) => [c.challengeKey, c]));

    return SYSTEM_CHALLENGES.map((ch) => {
      const userCh = claimedMap.get(ch.key);
      const progress = ch.calcProgress(stats);
      const isCompleted = progress >= ch.target;
      const isClaimed = userCh?.isClaimed ?? false;
      const claimedAt = userCh?.claimedAt ? userCh.claimedAt.toISOString() : null;

      return {
        key: ch.key,
        title: ch.title,
        description: ch.description,
        target: ch.target,
        progress,
        duration: ch.duration,
        difficulty: ch.difficulty,
        icon: ch.icon,
        color: ch.color,
        sparksReward: ch.sparksReward,
        xpReward: ch.xpReward,
        isCompleted,
        isClaimed,
        claimedAt,
      };
    });
  }

  async claimChallenge(dto: ClaimChallengeDto) {
    const { userId, challengeKey } = dto;
    const challengeDef = SYSTEM_CHALLENGES.find((c) => c.key === challengeKey);
    if (!challengeDef) {
      throw new BadRequestException('Challenge not found.');
    }

    const existingClaim = await this.prisma.userChallenge.findUnique({
      where: { userId_challengeKey: { userId, challengeKey } },
    });
    if (existingClaim?.isClaimed) {
      throw new BadRequestException('This challenge reward has already been claimed.');
    }

    const userHabits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });
    const shields = await this.prisma.powerUpUsage.findMany({ where: { userId } });
    const totalLogs = userHabits.reduce((acc, h) => acc + (h.logs?.length || 0), 0);
    let maxStreak = 0;
    for (const h of userHabits) {
      const s = this.calculateStreakForHabit(h.logs, shields, h.id, h.mode, h.days, h.perWeek, h.target);
      if (s > maxStreak) maxStreak = s;
    }
    const progress = challengeDef.calcProgress({ maxStreak, totalLogs });
    if (progress < challengeDef.target) {
      throw new BadRequestException(`Challenge requirements not yet met (${progress}/${challengeDef.target}).`);
    }

    const currentProfile = await this.prisma.userGamification.findUnique({ where: { userId } });
    const newXp = (currentProfile?.totalXp || 0) + challengeDef.xpReward;
    const newLevel = this.calculateLevel(newXp);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.userChallenge.upsert({
        where: { userId_challengeKey: { userId, challengeKey } },
        create: {
          userId,
          challengeKey,
          title: challengeDef.title,
          progress,
          target: challengeDef.target,
          sparksReward: challengeDef.sparksReward,
          xpReward: challengeDef.xpReward,
          isCompleted: true,
          completedAt: now,
          isClaimed: true,
          claimedAt: now,
        },
        update: {
          isCompleted: true,
          completedAt: now,
          isClaimed: true,
          claimedAt: now,
        },
      }),
      this.prisma.userGamification.update({
        where: { userId },
        data: {
          totalXp: newXp,
          level: newLevel,
          sparksBalance: { increment: challengeDef.sparksReward },
        },
      }),
      this.prisma.gamificationLedger.create({
        data: {
          userId,
          type: 'EARN',
          amount: challengeDef.sparksReward,
          sourceType: 'CHALLENGE_REWARD',
          sourceId: `challenge_${userId}_${challengeKey}`,
          metadata: {
            challengeKey,
            challengeTitle: challengeDef.title,
            xpGained: challengeDef.xpReward,
          },
        },
      }),
      this.prisma.notification.create({
        data: {
          userId,
          type: 'CHALLENGE_CLAIMED',
          title: `Challenge Completed: ${challengeDef.title}! ⚔️`,
          body: `You successfully claimed +${challengeDef.sparksReward} Sparks & +${challengeDef.xpReward} XP for completing ${challengeDef.title}!`,
        },
      }),
    ]);

    const updatedSummary = await this.getSummary(userId);
    return {
      success: true,
      message: `Claimed +${challengeDef.sparksReward} Sparks and +${challengeDef.xpReward} XP!`,
      summary: updatedSummary,
    };
  }

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

  async activateBoost(dto: ActivateBoostDto) {
    const { userId, powerUpType, durationHours = 24, multiplier = 2 } = dto;

    const inventory = await this.prisma.powerUpInventory.findUnique({
      where: { userId_powerUpType: { userId, powerUpType } },
    });

    if (!inventory || inventory.quantity <= 0) {
      throw new BadRequestException(`You do not have any ${powerUpType} power-ups available in inventory.`);
    }

    const expiresAt = new Date(Date.now() + durationHours * 3600 * 1000);
    const idempotencyKey = `boost_${userId}_${Date.now()}`;

    await this.prisma.$transaction([
      this.prisma.powerUpInventory.update({
        where: { userId_powerUpType: { userId, powerUpType } },
        data: { quantity: { decrement: 1 } },
      }),
      this.prisma.userGamification.update({
        where: { userId },
        data: {
          boostMultiplier: multiplier,
          boostExpiresAt: expiresAt,
        },
      }),
      this.prisma.powerUpUsage.create({
        data: {
          userId,
          powerUpType,
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
          metadata: { powerUpType, multiplier, durationHours, expiresAt: expiresAt.toISOString() },
        },
      }),
      this.prisma.notification.create({
        data: {
          userId,
          type: 'BOOST_ACTIVATED',
          title: 'Double XP Activated! ⚡',
          body: `Double XP power-up is active for the next ${durationHours} hours. All habit check-ins will award 2x XP!`,
        },
      }),
    ]);

    const summary = await this.getSummary(userId);
    return {
      success: true,
      message: `Double XP activated for ${durationHours} hours!`,
      summary,
    };
  }

  async useStreakShield(dto: UseShieldDto) {
    const { userId, habitId, missedDate, itemType } = dto;

    const typeFilter = itemType
      ? [itemType]
      : ['STREAK_SHIELD', 'STREAK_FREEZE'];

    const inventory = await this.prisma.powerUpInventory.findFirst({
      where: {
        userId,
        powerUpType: { in: typeFilter },
        quantity: { gt: 0 },
      },
    });

    if (!inventory) {
      throw new BadRequestException(
        itemType === 'STREAK_FREEZE'
          ? 'You do not have any Streak Freezes available in inventory.'
          : 'You do not have any Streak Shields available in inventory.'
      );
    }

    const targetDate = new Date(missedDate);
    targetDate.setHours(12, 0, 0, 0);
    const dateStr = targetDate.toISOString().split('T')[0];
    const idempotencyKey = `shield_${userId}_${habitId || 'global'}_${dateStr}`;

    const alreadyUsed = await this.prisma.powerUpUsage.findUnique({
      where: { idempotencyKey },
    });
    if (alreadyUsed) {
      throw new BadRequestException('This date is already protected by a Streak Shield or Freeze.');
    }

    const isFreeze = inventory.powerUpType === 'STREAK_FREEZE';

    await this.prisma.$transaction([
      this.prisma.powerUpInventory.update({
        where: { id: inventory.id },
        data: { quantity: { decrement: 1 } },
      }),
      this.prisma.powerUpUsage.create({
        data: {
          userId,
          powerUpType: inventory.powerUpType,
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
          metadata: { habitId: habitId || 'global', missedDate: dateStr, usedItem: inventory.powerUpType },
        },
      }),
      this.prisma.notification.create({
        data: {
          userId,
          type: isFreeze ? 'FREEZE_USED' : 'SHIELD_USED',
          title: isFreeze ? 'Streak Freeze Activated ❄️' : 'Streak Shield Activated 🛡️',
          body: isFreeze
            ? `All habit streaks have been frozen for 24 hours on ${dateStr}!`
            : `Your streak for ${dateStr} has been protected!`,
        },
      }),
    ]);

    // Check achievement for using shield
    await this.checkAndUnlockAchievements(userId);

    const updated = await this.getSummary(userId);
    return {
      success: true,
      message: isFreeze
        ? 'Streak Freeze successfully activated! All streaks frozen for 24 hours.'
        : 'Streak Shield successfully activated! Your streak is protected.',
      summary: updated,
    };
  }

  async autoProtectStreaks(userId: string) {
    const inventory = await this.prisma.powerUpInventory.findFirst({
      where: {
        userId,
        powerUpType: { in: ['STREAK_SHIELD', 'STREAK_FREEZE'] },
        quantity: { gt: 0 },
      },
    });

    if (!inventory) {
      return { success: true, protected: false, count: 0, message: 'No shields in inventory' };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(12, 0, 0, 0);
    const dateStr = yesterday.toISOString().split('T')[0];

    const habits = await this.prisma.habit.findMany({
      where: { userId, archived: false },
      include: { logs: true },
    });

    const shields = await this.prisma.powerUpUsage.findMany({ where: { userId } });

    let protectedCount = 0;
    for (const habit of habits) {
      const hasLogYesterday = habit.logs.some((l) => {
        const ld = new Date(l.completedAt);
        return ld.toISOString().split('T')[0] === dateStr;
      });

      const hasShieldYesterday = shields.some((s) => {
        if (!s.missedDate) return false;
        if (s.relatedHabitId && s.relatedHabitId !== habit.id) return false;
        return new Date(s.missedDate).toISOString().split('T')[0] === dateStr;
      });

      if (!hasLogYesterday && !hasShieldYesterday) {
        const streak = this.calculateStreakForHabit(
          habit.logs,
          shields,
          habit.id,
          habit.mode,
          habit.days,
          habit.perWeek,
          habit.target
        );

        if (streak >= 2) {
          await this.useStreakShield({
            userId,
            habitId: habit.id,
            missedDate: yesterday.toISOString(),
            itemType: inventory.powerUpType,
          });
          protectedCount++;
          break; // Use 1 shield per auto-protect cycle
        }
      }
    }

    return { success: true, protected: protectedCount > 0, count: protectedCount };
  }

  async recoverStreak(dto: RecoverStreakDto) {
    const { userId, habitId, missedDate } = dto;

    const recoveryItem = await this.prisma.powerUpInventory.findFirst({
      where: {
        userId,
        powerUpType: { in: ['STREAK_RECOVERY', 'STREAK_SHIELD'] },
        quantity: { gt: 0 },
      },
    });

    if (!recoveryItem) {
      throw new BadRequestException('You do not have any Streak Recovery or Shield power-ups available.');
    }

    const targetDate = new Date(missedDate);
    targetDate.setHours(12, 0, 0, 0);
    const dateStr = targetDate.toISOString().split('T')[0];
    const idempotencyKey = `recovery_${userId}_${habitId}_${dateStr}`;

    const alreadyProtected = await this.prisma.powerUpUsage.findUnique({
      where: { idempotencyKey },
    });
    if (alreadyProtected) {
      throw new BadRequestException('This missed date is already protected.');
    }

    await this.prisma.$transaction([
      this.prisma.powerUpInventory.update({
        where: { id: recoveryItem.id },
        data: { quantity: { decrement: 1 } },
      }),
      this.prisma.powerUpUsage.create({
        data: {
          userId,
          powerUpType: 'STREAK_RECOVERY',
          relatedHabitId: habitId,
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
          metadata: { habitId, missedDate: dateStr, restoredBy: recoveryItem.powerUpType },
        },
      }),
      this.prisma.notification.create({
        data: {
          userId,
          type: 'STREAK_RECOVERED',
          title: 'Streak Restored! 🛡️',
          body: `Your habit streak has been successfully recovered for ${dateStr}!`,
        },
      }),
    ]);

    const summary = await this.getSummary(userId);
    return {
      success: true,
      message: `Streak for ${dateStr} successfully restored!`,
      summary,
    };
  }

  async getShieldUsages(userId: string) {
    return this.prisma.powerUpUsage.findMany({
      where: { userId, powerUpType: { in: ['STREAK_SHIELD', 'STREAK_FREEZE', 'STREAK_RECOVERY'] } },
      orderBy: { missedDate: 'desc' },
    });
  }

  async getInventory(userId: string) {
    return this.prisma.powerUpInventory.findMany({
      where: { userId },
      orderBy: { powerUpType: 'asc' },
    });
  }

  async getLedger(userId: string, page: number = 1, limit: number = 50) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const skip = (safePage - 1) * safeLimit;

    const [entries, total] = await Promise.all([
      this.prisma.gamificationLedger.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: safeLimit,
        skip,
      }),
      this.prisma.gamificationLedger.count({
        where: { userId },
      }),
    ]);

    return {
      entries,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async getLeaderboard(currentUserId?: string) {
    const gamifications = await this.prisma.userGamification.findMany({
      take: 100,
      orderBy: [{ totalXp: 'desc' }, { sparksBalance: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            habits: {
              where: { archived: false },
              select: {
                id: true,
                logs: {
                  select: { completedAt: true, value: true },
                  orderBy: { completedAt: 'desc' },
                },
              },
            },
          },
        },
      },
    });

    // Calculate weekly XP from ledger
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyLedgerRecords = await this.prisma.gamificationLedger.findMany({
      where: {
        type: 'EARN',
        createdAt: { gte: sevenDaysAgo },
      },
    });

    const weeklyXpMap = new Map<string, number>();
    for (const record of weeklyLedgerRecords) {
      const meta = record.metadata as any;
      const gained = meta?.xpGained || 0;
      weeklyXpMap.set(record.userId, (weeklyXpMap.get(record.userId) || 0) + gained);
    }

    // Calculate monthly XP from ledger (30-day window)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyLedgerRecords = await this.prisma.gamificationLedger.findMany({
      where: {
        type: 'EARN',
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const monthlyXpMap = new Map<string, number>();
    for (const record of monthlyLedgerRecords) {
      const meta = record.metadata as any;
      const gained = meta?.xpGained || 0;
      monthlyXpMap.set(record.userId, (monthlyXpMap.get(record.userId) || 0) + gained);
    }

    // Friend list for friends leaderboard
    const friendships = currentUserId
      ? await this.prisma.friendship.findMany({
          where: {
            OR: [{ userId: currentUserId }, { friendId: currentUserId }],
            status: 'ACCEPTED',
          },
        })
      : [];

    const friendIds = new Set<string>();
    if (currentUserId) {
      friendIds.add(currentUserId);
      for (const f of friendships) {
        friendIds.add(f.userId === currentUserId ? f.friendId : f.userId);
      }
    }

    const entries = gamifications.map((item, index) => {
      const user = item.user;
      const rawName = user?.name || user?.email?.split('@')[0] || 'Habit Explorer';
      const username = '@' + (user?.email?.split('@')[0] || `user_${item.userId.slice(-4)}`);

      let maxStreak = 0;
      if (user?.habits) {
        for (const habit of user.habits) {
          const logs = habit.logs || [];
          let current = 0;
          const checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);

          for (let d = 0; d < 365; d++) {
            const hasLog = logs.some((l) => {
              const dt = new Date(l.completedAt);
              dt.setHours(0, 0, 0, 0);
              return dt.getTime() === checkDate.getTime();
            });
            if (hasLog) {
              current++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else if (d === 0) {
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          if (current > maxStreak) maxStreak = current;
        }
      }

      const hasRecentLog = user?.habits?.some((h) => {
        const lastLog = h.logs[0];
        if (!lastLog) return false;
        const now = Date.now();
        const logTime = new Date(lastLog.completedAt).getTime();
        return now - logTime < 24 * 60 * 60 * 1000;
      });

      const weeklyXp = weeklyXpMap.get(item.userId) || 0;
      const monthlyXp = monthlyXpMap.get(item.userId) || 0;

      return {
        id: item.userId,
        rank: index + 1,
        name: rawName,
        username,
        avatar: user?.image || null,
        sparks: item.sparksBalance,
        totalXp: item.totalXp,
        weeklyXp,
        monthlyXp,
        level: item.level,
        streak: maxStreak,
        trend: hasRecentLog ? ('up' as const) : ('same' as const),
        isUser: item.userId === currentUserId,
      };
    });

    const weeklyEntries = [...entries]
      .sort((a, b) => b.weeklyXp - a.weeklyXp)
      .map((e, idx) => ({ ...e, rank: idx + 1 }));

    const monthlyEntries = [...entries]
      .sort((a, b) => (b.monthlyXp || 0) - (a.monthlyXp || 0))
      .map((e, idx) => ({ ...e, rank: idx + 1 }));

    const friendsEntries = entries
      .filter((e) => friendIds.has(e.id))
      .map((e, idx) => ({ ...e, rank: idx + 1 }));

    return {
      global: entries,
      weekly: weeklyEntries,
      monthly: monthlyEntries,
      friends: friendsEntries,
    };
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  async markNotificationsAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }
}
