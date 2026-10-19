import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { resolveScope } from '../common/scope';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { GroupMember } from '../entities/group-member.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(Expense)
    private readonly expenses: Repository<Expense>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
  ) {}

  async findAll(userId: number) {
    const scope = await resolveScope(this.members, userId);
    return this.categories.find({
      where: { groupId: scope },
      order: { name: 'ASC' },
    });
  }

  async create(userId: number, dto: CreateCategoryDto) {
    const scope = await resolveScope(this.members, userId);
    const name = dto.name.trim();
    const exists = await this.categories.findOne({
      where: { groupId: scope, name },
    });
    if (exists) throw new ConflictException('Kategori sudah ada');
    return this.categories.save(
      this.categories.create({ groupId: scope, userId, name }),
    );
  }

  async update(userId: number, id: number, dto: UpdateCategoryDto) {
    const scope = await resolveScope(this.members, userId);
    const category = await this.findOwned(scope, id);
    category.name = dto.name.trim();
    return this.categories.save(category);
  }

  async remove(userId: number, id: number) {
    const scope = await resolveScope(this.members, userId);
    await this.findOwned(scope, id);
    const used = await this.expenses.count({
      where: { groupId: scope, categoryId: id },
    });
    if (used > 0) {
      throw new BadRequestException(
        'Kategori masih dipakai expense, tidak bisa dihapus',
      );
    }
    await this.categories.delete({ id, groupId: scope });
    return { success: true };
  }

  private async findOwned(scope: number, id: number) {
    const category = await this.categories.findOne({
      where: { id, groupId: scope },
    });
    if (!category) throw new NotFoundException('Kategori tidak ditemukan');
    return category;
  }
}
