import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Category]), AuthModule],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
