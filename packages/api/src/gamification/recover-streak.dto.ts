import { IsNotEmpty, IsString } from "class-validator";

export class RecoverStreakDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  habitId!: string;

  @IsNotEmpty()
  @IsString()
  missedDate!: string;
}

