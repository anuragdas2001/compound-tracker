import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  emailStreakReminder?: boolean;

  @IsOptional()
  @IsBoolean()
  emailWeeklyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublicProfile?: boolean;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsNumber()
  dayCutoffHour?: number;
}

