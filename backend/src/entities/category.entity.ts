import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Expense } from './expense.entity';
import { User } from './user.entity';

@Entity('categories')
@Unique(['groupId', 'name'])
@Index('idx_userId', ['userId'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  groupId: number | null;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @OneToMany(() => Expense, (expense) => expense.category)
  expenses: Expense[];
}
