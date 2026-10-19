import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Group,
  GroupInvite,
  GroupMember,
  Expense,
  Category,
} from '../entities';
import { User } from '../entities/user.entity';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Group, GroupMember, GroupInvite, User, Expense, Category]), JwtModule.register({ secret: process.env.JWT_SECRET })],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
