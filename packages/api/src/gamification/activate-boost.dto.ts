import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class ActivateBoostDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  powerUpType!: string;

  @IsOptional()
  @IsNumber()
  multiplier?: number;

  @IsOptional()
  @IsNumber()
  durationHours?: number;
}

