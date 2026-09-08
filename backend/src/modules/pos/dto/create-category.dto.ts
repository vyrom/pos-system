import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Smoothie & Soda', description: 'Category name in English' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ស្មូទី & សូដា', required: false, description: 'Category name in Khmer' })
  @IsOptional()
  @IsString()
  nameKh?: string;

  @ApiProperty({ example: '🍹', required: false, description: 'Category icon or emoji' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: true, required: false, description: 'Active status (true = enabled, false = disabled)' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: 'Smoothie & Soda', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'ស្មូទី & សូដា', required: false })
  @IsOptional()
  @IsString()
  nameKh?: string;

  @ApiProperty({ example: '🍹', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
