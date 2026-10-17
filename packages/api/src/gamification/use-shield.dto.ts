import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UseShieldDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  habitId?: string;

  @IsNotEmpty()
  @IsString()
  missedDate!: string;
}
