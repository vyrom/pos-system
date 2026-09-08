import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  name?: string;
  category?: string;
  cost?: number;
  packagingCost?: number;
  price?: number;
  stock?: number;
  icon?: string;
  sku?: string;
  imageUrl?: string;
  recipe?: any[];
}
