import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { GamificationService } from "../gamification/gamification.service";

import { CreateHabitDto, UpdateHabitDto } from "@repo/api";

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService,
  ) {}

  async create(
    userId: string,
    dto: CreateHabitDto,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (user?.plan === "STARTER") {
      const activeHabitsCount = await this.prisma.habit.count({
        where: { userId, archived: false },
      });

      if (activeHabitsCount >= 3) {
        throw new ForbiddenException(
          "You have reached the limit of 3 habits on the Starter plan. Upgrade to Pro to track unlimited habits."
        );
      }

      if (dto.mode && dto.mode !== "daily") {
        throw new ForbiddenException(
          "Custom habit schedules are only available on the Pro plan."
        );
      }
    }

    return this.prisma.habit.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(userId: string, archived = false) {
    return this.prisma.habit.findMany({
      where: {
        userId,
        archived,
      },
      include: {
        logs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.habit.findUnique({
      where: { id },
      include: {
        logs: true,
      },
    });
  }

  async update(
    id: string,
    dto: UpdateHabitDto,
  ) {
    const habit = await this.prisma.habit.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!habit) throw new NotFoundException("Habit not found");

    const user = await this.prisma.user.findUnique({
      where: { id: habit.userId },
      select: { plan: true },
    });

    if (user?.plan === "STARTER") {
      if (dto.mode && dto.mode !== "daily") {
        throw new ForbiddenException(
          "Custom habit schedules are only available on the Pro plan."
        );
      }
    }

    return this.prisma.habit.update({
      where: { id },
      data: dto,
    });
  }

  async archive(id: string) {
    return this.prisma.habit.update({
      where: { id },
      data: {
        archived: true,
      },
    });
  }

  async unarchive(id: string) {
    return this.prisma.habit.update({
      where: { id },
      data: {
        archived: false,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.habitLog.deleteMany({
      where: { habitId: id },
    });
    return this.prisma.habit.delete({
      where: { id },
    });
  }

  async completeHabit(
    habitId: string,
    completedAt?: string,
  ) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true, mode: true, days: true, target: true },
    });

    if (!habit) {
      throw new NotFoundException("Habit not found");
    }

    const date = completedAt ? new Date(completedAt) : new Date();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const targetDayStart = new Date(date);
    targetDayStart.setHours(0, 0, 0, 0);

    if (targetDayStart.getTime() < todayStart.getTime()) {
      throw new BadRequestException("Cannot mark habits complete after their scheduled day has passed.");
    }

    if (habit.mode === "days" && habit.days && habit.days.length > 0) {
      const dayIndex = (date.getDay() + 6) % 7;
      const utcDayIndex = (date.getUTCDay() + 6) % 7;
      if (!habit.days.includes(dayIndex) && !habit.days.includes(utcDayIndex)) {
        throw new BadRequestException("This habit is not scheduled for this day.");
      }
    }

    const targetVal = habit.target || 1;
    const log = await this.prisma.habitLog.create({
      data: {
        habitId,
        completedAt: date,
        value: targetVal,
      },
    });

    if (habit.userId) {
      await this.gamificationService.awardHabitCompletion(habit.userId, habitId, log.id);
    }

    return log;
  }

  async toggleHabit(
    habitId: string,
    completedAt?: string,
  ) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true, mode: true, days: true, goal: true, target: true },
    });

    if (!habit) {
      throw new NotFoundException("Habit not found");
    }

    const target = habit.target || 1;
    const date = completedAt ? new Date(completedAt) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLogs = await this.prisma.habitLog.findMany({
      where: {
        habitId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const isCurrentlyComplete = existingLogs.some((l) => (l.value ?? 1) >= target);

    if (existingLogs.length > 0 && isCurrentlyComplete) {
      const logIdToRevoke = existingLogs[0]?.id;
      await this.prisma.habitLog.deleteMany({
        where: {
          id: { in: existingLogs.map((l) => l.id) },
        },
      });

      if (habit.userId && logIdToRevoke) {
        await this.gamificationService.revokeHabitCompletion(habit.userId, habitId, logIdToRevoke);
      }

      return { status: "uncompleted", value: 0, completed: false };
    } else {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const targetDayStart = new Date(date);
      targetDayStart.setHours(0, 0, 0, 0);

      if (targetDayStart.getTime() < todayStart.getTime()) {
        throw new BadRequestException("Cannot mark habits complete after their scheduled day has passed.");
      }

      // Check scheduled days only if mode is "days" (flex and daily are allowed on any day)
      if (habit.mode === "days" && habit.days && habit.days.length > 0) {
        const dayIndex = (date.getDay() + 6) % 7;
        const utcDayIndex = (date.getUTCDay() + 6) % 7;
        if (!habit.days.includes(dayIndex) && !habit.days.includes(utcDayIndex)) {
          throw new BadRequestException("This habit is not scheduled for this day.");
        }
      }

      let log;
      const firstExisting = existingLogs[0];
      if (firstExisting) {
        log = await this.prisma.habitLog.update({
          where: { id: firstExisting.id },
          data: { value: target },
        });
      } else {
        log = await this.prisma.habitLog.create({
          data: {
            habitId,
            completedAt: date,
            value: target,
          },
        });
      }

      if (habit.userId) {
        await this.gamificationService.awardHabitCompletion(habit.userId, habitId, log.id);
      }

      return { status: "completed", value: target, completed: true, log };
    }
  }

  async updateProgress(
    habitId: string,
    value: number,
    completedAt?: string,
  ) {
    const habit = await this.prisma.habit.findUnique({
      where: { id: habitId },
      select: { userId: true, mode: true, days: true, goal: true, target: true },
    });

    if (!habit) {
      throw new NotFoundException("Habit not found");
    }

    const date = completedAt ? new Date(completedAt) : new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLogs = await this.prisma.habitLog.findMany({
      where: {
        habitId,
        completedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const target = habit.target || 1;
    const targetValue = Math.max(0, value);

    const existingLog = existingLogs[0];
    if (existingLog) {
      const previousValue = existingLog.value ?? 1;

      if (targetValue <= 0) {
        await this.prisma.habitLog.deleteMany({
          where: { id: { in: existingLogs.map((l) => l.id) } },
        });

        if (habit.userId && previousValue >= target) {
          await this.gamificationService.revokeHabitCompletion(habit.userId, habitId, existingLog.id);
        }

        return { status: "uncompleted", value: 0, completed: false };
      } else {
        const updatedLog = await this.prisma.habitLog.update({
          where: { id: existingLog.id },
          data: { value: targetValue },
        });

        if (targetValue >= target && previousValue < target && habit.userId) {
          await this.gamificationService.awardHabitCompletion(habit.userId, habitId, existingLog.id);
        } else if (targetValue < target && previousValue >= target && habit.userId) {
          await this.gamificationService.revokeHabitCompletion(habit.userId, habitId, existingLog.id);
        }

        return {
          status: targetValue >= target ? "completed" : "in_progress",
          value: targetValue,
          target,
          completed: targetValue >= target,
          log: updatedLog,
        };
      }
    } else {
      if (targetValue <= 0) {
        return { status: "uncompleted", value: 0, completed: false };
      }

      if (habit.mode === "days" && habit.days && habit.days.length > 0) {
        const dayIndex = (date.getDay() + 6) % 7;
        const utcDayIndex = (date.getUTCDay() + 6) % 7;
        if (!habit.days.includes(dayIndex) && !habit.days.includes(utcDayIndex)) {
          throw new BadRequestException("This habit is not scheduled for this day.");
        }
      }

      const log = await this.prisma.habitLog.create({
        data: {
          habitId,
          completedAt: date,
          value: targetValue,
        },
      });

      if (targetValue >= target && habit.userId) {
        await this.gamificationService.awardHabitCompletion(habit.userId, habitId, log.id);
      }

      return {
        status: targetValue >= target ? "completed" : "in_progress",
        value: targetValue,
        target,
        completed: targetValue >= target,
        log,
      };
    }
  }

  async getDailyNote(userId: string, dateKey: string) {
    const note = await this.prisma.dailyNote.findUnique({
      where: { userId_dateKey: { userId, dateKey } },
    });
    return note || { userId, dateKey, content: "" };
  }

  async saveDailyNote(userId: string, dateKey: string, content: string) {
    return this.prisma.dailyNote.upsert({
      where: { userId_dateKey: { userId, dateKey } },
      create: { userId, dateKey, content },
      update: { content },
    });
  }
}
