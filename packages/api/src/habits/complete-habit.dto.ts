import {
    IsDateString,
    IsNumber,
    IsOptional,
  } from "class-validator";
  
  export class CompleteHabitDto {
    @IsOptional()
    @IsDateString()
    completedAt?: string;

    @IsOptional()
    @IsNumber()
    value?: number;
  }

  export class UpdateHabitProgressDto {
    @IsNumber()
    value!: number;

    @IsOptional()
    @IsDateString()
    completedAt?: string;
  }
