import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseCategory, ExpensePaymentMethod } from '../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({ example: 'Monthly Water Bill', description: 'Title or description of the shop expense', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: 'WATER',
    enum: ['WATER', 'ELECTRICITY', 'RENT', 'SALARY', 'MAINTENANCE', 'OTHER'],
    description: 'Category of operating expense',
  })
  @IsString()
  @IsNotEmpty()
  category: ExpenseCategory;

  @ApiProperty({ example: 45.5, description: 'Expense amount in USD' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-09-01', description: 'Date of expense (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    example: 'CASH',
    enum: ['CASH', 'QR_CODE', 'CARD', 'BANK_TRANSFER'],
    description: 'Payment method used to settle the expense',
    required: false,
  })
  @IsOptional()
  @IsString()
  paymentMethod?: ExpensePaymentMethod;

  @ApiProperty({ example: 'Phnom Penh Water Supply Authority invoice #9401', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
