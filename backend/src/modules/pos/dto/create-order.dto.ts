import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Min, ValidateNested } from 'class-validator';

export class ToppingDto {
  @ApiProperty({ example: 'Boba Pearls' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0.50 })
  @IsNumber()
  @Min(0)
  price: number;
}

export class DrinkOptionDto {
  @ApiProperty({ example: '50%', required: false })
  @IsOptional()
  @IsString()
  sugarLevel?: string;

  @ApiProperty({ example: 'Less Ice', required: false })
  @IsOptional()
  @IsString()
  iceLevel?: string;

  @ApiProperty({ type: [ToppingDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ToppingDto)
  toppings?: ToppingDto[];

  @ApiProperty({ example: 'Extra napkin', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderItemDto {
  @ApiProperty({ example: 'prod-1' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 'Espresso Single' })
  @IsString()
  productName: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({ example: 2.5 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ type: DrinkOptionDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => DrinkOptionDto)
  options?: DrinkOptionDto;

  @ApiProperty({ example: 'Less sweet', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  QR_CODE = 'QR_CODE',
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 5.0 })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ example: 0.5 })
  @IsNumber()
  @Min(0)
  tax: number;

  @ApiProperty({ example: 0.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiProperty({ example: 5.5 })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountTendered?: number;

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  change?: number;

  @ApiProperty({ example: 'TX-1725700000-abc1234', required: false })
  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}
