import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateIngredientDto {
  @ApiProperty({ example: 'Coffee Sayon' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Coffee Beans' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  @IsNotEmpty()
  uom: string;

  @ApiProperty({ example: 0.012 })
  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty({ example: '☕', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class RestockIngredientDto {
  @ApiProperty({ example: 1000, description: 'Quantity to add to current stock' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 'Supplier weekly restock delivery', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
