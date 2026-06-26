import {
    IsBooleanString,
    IsOptional,
  } from "class-validator";
  
  export class HabitQueryDto {
    @IsOptional()
    @IsBooleanString()
    archived?: string;
  }