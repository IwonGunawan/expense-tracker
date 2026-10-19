import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { Category } from './entities/category.entity';
import { Expense } from './entities/expense.entity';
import { User } from './entities/user.entity';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupInvite } from './entities/group-invite.entity';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';
import { GroupsModule } from './groups/groups.module';

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
      entities: [User, Category, Expense, Group, GroupMember, GroupInvite],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
    AuthModule,
    CategoriesModule,
    ExpensesModule,
    GroupsModule,
  ],
})
export class AppModule {}
