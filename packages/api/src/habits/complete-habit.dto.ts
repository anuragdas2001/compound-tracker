import {
    IsDateString,
    IsOptional,
  } from "class-validator";
  
  export class CompleteHabitDto {
    @IsOptional()
    @IsDateString()
    completedAt?: string;
  }