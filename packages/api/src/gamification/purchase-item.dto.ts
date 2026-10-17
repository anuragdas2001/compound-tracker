import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class PurchaseItemDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @IsNotEmpty()
  @IsString()
  itemType!: string;

  @IsNotEmpty()
  @IsNumber()
  cost!: number;
}
