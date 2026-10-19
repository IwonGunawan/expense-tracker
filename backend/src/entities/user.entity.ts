import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Expense } from './expense.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];
}
