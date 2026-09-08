import { ApiProperty } from '@nestjs/swagger';

export class CategoryEntity {
  @ApiProperty({ example: 'cat-coffee' })
  id: string;

  @ApiProperty({ example: 'Coffee' })
  name: string;

  @ApiProperty({ example: 'កាហ្វេ', required: false })
  nameKh?: string;

  @ApiProperty({ example: '☕', required: false })
  icon?: string;

  @ApiProperty({ example: true, description: 'True if active in POS menu, false if disabled' })
  isEnabled: boolean;

  @ApiProperty({ example: 8, required: false, description: 'Number of product items in this category' })
  itemCount?: number;

  @ApiProperty({ example: '2026-09-08T09:00:00.000Z' })
  createdAt: string;
}
