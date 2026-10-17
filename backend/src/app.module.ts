import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Category } from './entities/category.entity';
import { Expense } from './entities/expense.entity';
import { User } from './entities/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD || undefined,
      extra: {
        socketPath: process.env.DB_SOCKET_PATH,
      },
      database: process.env.DB_DATABASE ?? 'expense-tracker',
      entities: [User, Category, Expense],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
    AuthModule,
    CategoriesModule,
    ExpensesModule,
  ],
})
export class AppModule {}
