import { ApiProperty } from '@nestjs/swagger';

export type ExpenseCategory =
  | 'WATER'
  | 'ELECTRICITY'
  | 'RENT'
  | 'SALARY'
  | 'MAINTENANCE'
  | 'OTHER';

export type ExpensePaymentMethod = 'CASH' | 'QR_CODE' | 'CARD' | 'BANK_TRANSFER';

export class Expense {
  @ApiProperty({ example: 'exp-1725678900' })
  id: string;

  @ApiProperty({ example: 'Monthly Water Bill' })
  title: string;

  @ApiProperty({ example: 'WATER', enum: ['WATER', 'ELECTRICITY', 'RENT', 'SALARY', 'MAINTENANCE', 'OTHER'] })
  category: ExpenseCategory;

  @ApiProperty({ example: 45.5 })
  amount: number;

  @ApiProperty({ example: '2026-09-01' })
  date: string;

  @ApiProperty({ example: 'CASH', enum: ['CASH', 'QR_CODE', 'CARD', 'BANK_TRANSFER'] })
  paymentMethod: ExpensePaymentMethod;

  @ApiProperty({ example: 'Clean water supply for coffee machine and washing', required: false })
  note?: string;

  @ApiProperty({ example: '2026-09-01T08:30:00.000Z' })
  createdAt: string;
}
