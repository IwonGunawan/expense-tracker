import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
  ) {}

  findAll(userId: number) {
    return this.categories.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async create(userId: number, dto: CreateCategoryDto) {
    const name = dto.name.trim();
    const exists = await this.categories.findOne({ where: { userId, name } });
    if (exists) throw new ConflictException('Kategori sudah ada');
    return this.categories.save(this.categories.create({ userId, name }));
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    const category = await this.findOwned(userId, id);
    category.name = dto.name.trim();
    return this.categories.save(category);
  }

  async remove(userId: number, id: number) {
    await this.findOwned(userId, id);
    const used = await this.expenses.count({
      where: { userId, categoryId: id },
    });
    if (used > 0) {
      throw new BadRequestException(
        'Kategori masih dipakai expense, tidak bisa dihapus',
      );
    }
    await this.categories.delete({ id, userId });
    return { success: true };
  }

  private async findOwned(userId: number, id: number) {
    const category = await this.categories.findOne({ where: { id, userId } });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }
}
