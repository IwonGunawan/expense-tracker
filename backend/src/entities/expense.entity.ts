import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { User } from './user.entity';

@Entity('expenses')
@Index(['userId', 'date'])
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.expenses, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column({ type: 'decimal', precision: 14, scale: 2 })
  amount: string;

  @Column({ default: '' })
  description: string;

  @Column({ type: 'date' })
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
