import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
} from "@nestjs/common";

import { HabitsService } from "./habits.service";

import { CreateHabitDto, UpdateHabitDto, CompleteHabitDto, UpdateHabitProgressDto } from "@repo/api";

@Controller("habits")
export class HabitsController {
  constructor(
    private readonly habitsService: HabitsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateHabitDto,
  ) {
    const userId = dto.userId;
    if (!userId) {
      throw new BadRequestException("Missing userId in payload");
    }

    return this.habitsService.create(
      userId,
      dto,
    );
  }

  @Get("notes")
  getNote(
    @Query("userId") userId: string,
    @Query("dateKey") dateKey: string,
  ) {
    if (!userId || !dateKey) {
      throw new BadRequestException("userId and dateKey are required");
    }
    return this.habitsService.getDailyNote(userId, dateKey);
  }

  @Post("notes")
  saveNote(
    @Body() dto: { userId: string; dateKey: string; content: string },
  ) {
    if (!dto.userId || !dto.dateKey) {
      throw new BadRequestException("userId and dateKey are required");
    }
    return this.habitsService.saveDailyNote(dto.userId, dto.dateKey, dto.content || "");
  }

  @Get()
  findAll(
    @Query("userId") userId?: string,
    @Query("archived") archived?: string,
  ) {
    const isArchived = archived === "true";
    return this.habitsService.findAll(
      userId || "68595c0f4d4d3dbd7b2b7f5a",
      isArchived,
    );
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
  ) {
    return this.habitsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateHabitDto,
  ) {
    return this.habitsService.update(
      id,
      dto,
    );
  }

  @Patch(":id/complete")
  complete(
    @Param("id") id: string,
    @Body() dto: CompleteHabitDto,
  ) {
    return this.habitsService.completeHabit(
      id,
      dto.completedAt,
    );
  }

  @Patch(":id/toggle")
  toggle(
    @Param("id") id: string,
    @Body() dto: { completedAt?: string },
  ) {
    return this.habitsService.toggleHabit(
      id,
      dto?.completedAt,
    );
  }

  @Patch(":id/progress")
  updateProgress(
    @Param("id") id: string,
    @Body() dto: UpdateHabitProgressDto,
  ) {
    return this.habitsService.updateProgress(
      id,
      dto.value,
      dto.completedAt,
    );
  }

  @Patch(":id/archive")
  archive(
    @Param("id") id: string,
  ) {
    return this.habitsService.archive(id);
  }

  @Patch(":id/unarchive")
  unarchive(
    @Param("id") id: string,
  ) {
    return this.habitsService.unarchive(id);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string,
  ) {
    return this.habitsService.remove(id);
  }
}
