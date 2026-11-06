import { IsNotEmpty, IsString } from "class-validator";

export class FriendRequestDto {
  @IsNotEmpty()
  @IsString()
  friendEmailOrUsername!: string;
}

