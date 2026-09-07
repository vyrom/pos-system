import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class RecipeItemDto {
  @ApiProperty({ example: 'ing-1', required: false })
  @IsOptional()
  @IsString()
  ingredientId?: string;

  @ApiProperty({ example: 'Coffee Sayon' })
  @IsString()
  @IsNotEmpty()
  ingredientName: string;

  @ApiProperty({ example: 18 })
  @IsNumber()
  @Min(0)
  qty: number;

  @ApiProperty({ example: 'g' })
  @IsString()
  @IsNotEmpty()
  uom: string;

  @ApiProperty({ example: 0.216 })
  @IsNumber()
  @Min(0)
  cost: number;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Iced Latte' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ice Coffee' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 0.46, description: 'Base ingredient/unit cost' })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ example: 0.22, description: 'Packaging and cup cost' })
  @IsNumber()
  @Min(0)
  packagingCost: number;

  @ApiProperty({ example: 3.00, description: 'Customer selling price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: '🧊', required: false, default: '☕' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 'ICE-002', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: '/uploads/products/iced-latte.webp', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ type: [RecipeItemDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  recipe?: RecipeItemDto[];
}
