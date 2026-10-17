import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pageInfo } from '../common/pagination';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import {
  CreateExpenseDto,
  QueryExpenseDto,
  QueryMonthlyDto,
  UpdateExpenseDto,
} from './dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  findAll(userId: number, q: QueryExpenseDto) {
    const page = q.page ?? 1;
    const limit = q.limit ?? 10;
    const qb = this.expenses
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.category', 'c')
      .where('e.userId = :userId', { userId })
      .orderBy('e.date', 'DESC')
      .addOrderBy('e.createdAt', 'DESC');

    if (q.from && q.to) {
      qb.andWhere('e.date BETWEEN :from AND :to', { from: q.from, to: q.to });
    } else if (q.from) {
      qb.andWhere('e.date >= :from', { from: q.from });
    } else if (q.to) {
      qb.andWhere('e.date <= :to', { to: q.to });
    }
    if (q.categoryId) {
      qb.andWhere('e.categoryId = :categoryId', { categoryId: q.categoryId });
    }

    qb.skip((page - 1) * limit).take(limit);

    return qb.getManyAndCount().then(([items, total]) => ({
      items,
      ...pageInfo(total, page, limit),
    }));
  }

  async create(userId: number, dto: CreateExpenseDto) {
    await this.assertCategory(userId, dto.categoryId);
    const saved = await this.expenses.save(
      this.expenses.create({
        userId,
        categoryId: dto.categoryId,
        amount: dto.amount.toFixed(2),
        description: dto.description ?? '',
        date: dto.date,
      }),
    );
    return this.findOne(userId, saved.id);
  }

  async update(userId: number, id: number, dto: UpdateExpenseDto) {
    const expense = await this.findOwned(userId, id);
    if (dto.categoryId !== undefined) {
      await this.assertCategory(userId, dto.categoryId);
      expense.categoryId = dto.categoryId;
    }
    if (dto.amount !== undefined) expense.amount = dto.amount.toFixed(2);
    if (dto.description !== undefined) expense.description = dto.description;
    if (dto.date !== undefined) expense.date = dto.date;
    await this.expenses.save(expense);
    return this.findOne(userId, id);
  }

  async remove(userId: number, id: number) {
    const expense = await this.findOwned(userId, id);
    await this.expenses.remove(expense);
    return { success: true };
  }

  async summary(userId: number, q: QueryExpenseDto) {
    const qb = this.expenses
      .createQueryBuilder('e')
      .innerJoin(Category, 'c', 'c.id = e.categoryId')
      .select('c.name', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .addSelect('COUNT(e.id)', 'count')
      .where('e.userId = :userId', { userId })
      .groupBy('c.id')
      .orderBy('total', 'DESC');

    if (q.from && q.to) {
      qb.andWhere('e.date BETWEEN :from AND :to', { from: q.from, to: q.to });
    } else if (q.from) {
      qb.andWhere('e.date >= :from', { from: q.from });
    } else if (q.to) {
      qb.andWhere('e.date <= :to', { to: q.to });
    }

    const rows = await qb.getRawMany<{
      category: string;
      total: string;
      count: string;
    }>();
    const categories = rows.map((r) => ({
      category: r.category,
      total: Number(r.total),
      count: Number(r.count),
    }));
    const overall = categories.reduce((s, c) => s + c.total, 0);
    return { overall, categories };
  }

  async monthly(userId: number, q: QueryMonthlyDto) {
    const year = q.year ?? new Date().getFullYear();
    const rows = await this.expenses
      .createQueryBuilder('e')
      .select('MONTH(e.date)', 'month')
      .addSelect('SUM(e.amount)', 'total')
      .where('e.userId = :userId', { userId })
      .andWhere('YEAR(e.date) = :year', { year })
      .groupBy('MONTH(e.date)')
      .getRawMany<{ month: string; total: string }>();

    const totals = new Map(
      rows.map((r) => [Number(r.month), Number(r.total)] as const),
    );
    return {
      year,
      months: Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: totals.get(i + 1) ?? 0,
      })),
    };
  }

  private async assertCategory(userId: number, categoryId: number) {
    const count = await this.categories.count({
      where: { id: categoryId, userId },
    });
    if (count === 0) {
      throw new BadRequestException('Kategori tidak valid');
    }
  }

  private async findOwned(userId: number, id: number) {
    const expense = await this.expenses.findOne({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Expense tidak ditemukan');
    return expense;
  }

  private async findOne(userId: number, id: number) {
    return this.expenses
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.category', 'c')
      .where('e.id = :id', { id })
      .andWhere('e.userId = :userId', { userId })
      .getOne();
  }
}
