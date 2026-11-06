import { IsNotEmpty, IsString } from "class-validator";

export class ClaimChallengeDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  challengeKey!: string;
}

