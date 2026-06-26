import {
    IsBoolean,
    IsOptional,
    IsString,
    MaxLength,
  } from "class-validator";
  
  export class UpdateHabitDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    title?: string;
  
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;
  
    @IsOptional()
    @IsString()
    color?: string;
  
    @IsOptional()
    @IsBoolean()
    archived?: boolean;
  }