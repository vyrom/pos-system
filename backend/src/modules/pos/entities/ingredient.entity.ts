import { ApiProperty } from '@nestjs/swagger';

export class Ingredient {
  @ApiProperty({ example: 'ing-1' })
  id: string;

  @ApiProperty({ example: 'Coffee Sayon' })
  name: string;

  @ApiProperty({ example: 'Coffee Beans' })
  category: string;

  @ApiProperty({ example: 5000, description: 'Current in-stock quantity' })
  stock: number;

  @ApiProperty({ example: 'g', description: 'Unit of measure: g, ml, pc, scoop, oz, slice' })
  uom: string;

  @ApiProperty({ example: 0.012, description: 'Cost per unit of measure' })
  costPerUnit: number;

  @ApiProperty({ example: 500, description: 'Reorder alert threshold' })
  minStock: number;

  @ApiProperty({ example: '☕', required: false })
  icon?: string;
}
