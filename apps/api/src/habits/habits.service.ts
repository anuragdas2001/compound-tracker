import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

import {CreateHabitDto,UpdateHabitDto} from "@repo/api";

@Injectable()
export class HabitsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    dto: CreateHabitDto,
  ) {
    return this.prisma.habit.create({
      data: {
        ...dto,
        userId:"68595c0f4d4d3dbd7b2b7f5a",
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: {
        userId,
        archived: false,
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
    return this.prisma.habitLog.create({
      data: {
        habitId,
        completedAt: completedAt
          ? new Date(completedAt)
          : new Date(),
      },
    });
  }

  async toggleHabit(
    habitId: string,
    completedAt?: string,
  ) {
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

    if (existingLogs.length > 0) {
      await this.prisma.habitLog.deleteMany({
        where: {
          id: { in: existingLogs.map((l) => l.id) },
        },
      });
      return { status: "uncompleted" };
    } else {
      await this.prisma.habitLog.create({
        data: {
          habitId,
          completedAt: date,
        },
      });
      return { status: "completed" };
    }
  }
}

