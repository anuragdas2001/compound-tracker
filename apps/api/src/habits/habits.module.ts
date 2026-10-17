import { Module } from "@nestjs/common";

import { HabitsController } from "./habits.controller";
import { HabitsService } from "./habits.service";

import { PrismaModule } from "../prisma/prisma.module";
import { GamificationModule } from "../gamification/gamification.module";

@Module({
  imports: [PrismaModule, GamificationModule],
  controllers: [HabitsController],
  providers: [HabitsService],
})
export class HabitsModule {}