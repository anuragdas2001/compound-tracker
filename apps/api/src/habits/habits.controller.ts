import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Query,
  } from "@nestjs/common";
  
  import { HabitsService } from "./habits.service";
  
  import { CreateHabitDto } from "@repo/api";
  import { UpdateHabitDto } from "@repo/api";
  import { CompleteHabitDto } from "@repo/api";
  
  @Controller("habits")
  export class HabitsController {
    constructor(
      private readonly habitsService: HabitsService,
    ) {}
  
    @Post()
    create(
      @Body() dto: CreateHabitDto,
    ) {
      const userId =
        "replace-with-auth-user-id";
  
      return this.habitsService.create(
        userId,
        dto,
      );
    }
  
    @Get()
    findAll(
        @Query("userId") userId: string,
    ) {
      return this.habitsService.findAll(
        userId,
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
  
    @Patch(":id/archive")
    archive(
      @Param("id") id: string,
    ) {
      return this.habitsService.archive(id);
    }
  
    @Delete(":id")
    remove(
      @Param("id") id: string,
    ) {
      return this.habitsService.remove(id);
    }
  }