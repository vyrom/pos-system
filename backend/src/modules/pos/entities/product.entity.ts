import { ApiProperty } from '@nestjs/swagger';

export class RecipeItem {
  @ApiProperty({ example: 'ing-1' })
  ingredientId?: string;

  @ApiProperty({ example: 'Coffee Sayon' })
  ingredientName: string;

  @ApiProperty({ example: 18 })
  qty: number;

  @ApiProperty({ example: 'g' })
  uom: string;

  @ApiProperty({ example: 0.216 })
  cost: number;
}

export class Product {
  @ApiProperty({ example: 'prod-1' })
  id: string;

  @ApiProperty({ example: 'Iced Latte' })
  name: string;

  @ApiProperty({ example: 'Ice Coffee' })
  category: string;

  @ApiProperty({ example: 0.46, description: 'Sum of recipe ingredients cost' })
  cost: number;

  @ApiProperty({ example: 0.22, description: 'Packaging / cup / container cost' })
  packagingCost: number;

  @ApiProperty({ example: 3.00, description: 'Selling price to customer' })
  price: number;

  @ApiProperty({ example: 45, description: 'Calculated cups available from raw ingredient stock' })
  stock: number;

  @ApiProperty({ example: '🧊' })
  icon: string;

  @ApiProperty({ example: 'ICE-002' })
  sku: string;

  @ApiProperty({ example: '/uploads/products/iced-latte.webp', required: false })
  imageUrl?: string;

  @ApiProperty({ type: [RecipeItem], required: false })
  recipe?: RecipeItem[];
}
