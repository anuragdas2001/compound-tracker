import {
    IsBoolean,
    IsOptional,
    IsString,
    MaxLength,
    IsNumber,
    IsArray,
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

    @IsOptional()
    @IsString()
    mode?: string;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    days?: number[];

    @IsOptional()
    @IsNumber()
    perWeek?: number;

    @IsOptional()
    @IsString()
    goal?: string;

    @IsOptional()
    @IsNumber()
    target?: number;

    @IsOptional()
    @IsString()
    unit?: string;

    @IsOptional()
    @IsString()
    why?: string;

    @IsOptional()
    @IsString()
    mini?: string;
  }