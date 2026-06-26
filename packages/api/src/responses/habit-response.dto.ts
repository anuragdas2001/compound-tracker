export class HabitResponseDto {
    id!: string;
  
    title!: string;
  
    description?: string;
  
    color?: string;
  
    archived!: boolean;
  
    createdAt!: Date;
  
    updatedAt!: Date;
  }