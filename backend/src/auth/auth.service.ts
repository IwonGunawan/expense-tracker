import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Expense } from '../entities/expense.entity';
import { User } from '../entities/user.entity';
import {
  ChangePasswordDto,
  DeleteAccountDto,
  LoginDto,
  RegisterDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase().trim();
    const exists = await this.users.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email sudah terdaftar');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({ email, passwordHash }),
    );
    return this.sign(user);
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase().trim();
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.email = :email', { email })
      .getOne();

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Email atau password salah');
    }
    return this.sign(user);
  }

  async me(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return { id: user.id, email: user.email };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    if (dto.currentPassword === dto.newPassword) {
      throw new ConflictException('Password baru harus berbeda');
    }
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId })
      .getOne();
    if (
      !user ||
      !(await bcrypt.compare(dto.currentPassword, user.passwordHash))
    ) {
      throw new UnauthorizedException('Password saat ini salah');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.users.save(user);
    return { success: true };
  }

  async deleteAccount(userId: number, dto: DeleteAccountDto) {
    const user = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: userId })
      .getOne();
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Password salah');
    }
    await this.expenses.delete({ userId });
    await this.categories.delete({ userId });
    await this.users.delete({ id: userId });
    return { success: true };
  }

  private sign(user: User) {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  }
}
