import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { IsNull, Repository } from 'typeorm';
import {
  Group,
  GroupMember,
  GroupRole,
  GroupInvite,
  InviteStatus,
} from '../entities';
import { Expense } from '../entities/expense.entity';
import { Category } from '../entities/category.entity';
import { User } from '../entities/user.entity';
import { CreateGroupDto, InviteUserDto, JoinGroupDto } from './dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groups: Repository<Group>,
    @InjectRepository(GroupMember) private members: Repository<GroupMember>,
    @InjectRepository(GroupInvite) private invites: Repository<GroupInvite>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(Expense) private expenses: Repository<Expense>,
    @InjectRepository(Category) private categories: Repository<Category>,
  ) {}

  async getMyGroup(userId: number) {
    const member = await this.members.findOne({
      where: { userId },
      relations: { group: true },
    });
    if (!member) return null;
    return { ...member.group, role: member.role };
  }

  async createGroup(userId: number, dto: CreateGroupDto) {
    const existing = await this.getMyGroup(userId);
    if (existing) throw new ConflictException('Sudah tergabung dalam grup');

    const group = await this.groups.save(
      this.groups.create({ name: dto.name, ownerId: userId }),
    );
    await this.members.save(
      this.members.create({ groupId: group.id, userId, role: GroupRole.OWNER }),
    );
    await this.claimPersonalData(userId, group.id);
    return group;
  }

  async inviteUser(userId: number, dto: InviteUserDto) {
    const inviter = await this.members.findOne({ where: { userId } });
    if (!inviter)
      throw new ForbiddenException(
        'Harus tergabung dalam grup untuk mengundang',
      );
    if (inviter.role !== GroupRole.OWNER)
      throw new ForbiddenException('Hanya admin grup yang bisa mengundang');

    const target = await this.users.findOne({
      where: { username: dto.username },
    });
    if (!target) throw new NotFoundException('Username tidak ditemukan');
    if (target.id === userId)
      throw new BadRequestException('Tidak bisa mengundang diri sendiri');

    const targetMember = await this.members.findOne({
      where: { userId: target.id },
    });
    if (targetMember)
      throw new ConflictException('User sudah tergabung dalam grup');

    const pending = await this.invites.findOne({
      where: {
        groupId: inviter.groupId,
        invitedUsername: dto.username,
        status: InviteStatus.PENDING,
      },
    });
    if (pending)
      throw new ConflictException('Undangan untuk user ini sudah dikirim');

    const code = randomBytes(4).toString('hex');
    const invite = await this.invites.save(
      this.invites.create({
        groupId: inviter.groupId,
        invitedById: userId,
        invitedUsername: dto.username,
        code,
      }),
    );
    return { code: invite.code };
  }

  async listInvites(userId: number) {
    const member = await this.members.findOne({ where: { userId } });
    if (!member) return [];
    return this.invites.find({
      where: { groupId: member.groupId, status: InviteStatus.PENDING },
      relations: { invitedBy: true },
    });
  }

  async listReceivedInvites(userId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    const member = await this.members.findOne({ where: { userId } });
    if (member) return [];
    return this.invites.find({
      where: { invitedUsername: user.username, status: InviteStatus.PENDING },
      relations: { group: true, invitedBy: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listMembers(userId: number) {
    const member = await this.members.findOne({ where: { userId } });
    if (!member) return [];
    const list = await this.members.find({
      where: { groupId: member.groupId },
      relations: { user: true },
      order: { joinedAt: 'ASC' },
    });
    return list.map((m) => ({
      id: m.userId,
      username: m.user.username,
      role: m.role,
      joinedAt: m.joinedAt,
    }));
  }

  async acceptInvite(userId: number, inviteId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const invite = await this.invites.findOne({ where: { id: inviteId } });
    if (!invite || invite.status !== InviteStatus.PENDING)
      throw new NotFoundException('Undangan tidak ditemukan atau sudah diproses');
    if (invite.invitedUsername !== user.username)
      throw new ForbiddenException('Undangan ini bukan untukmu');

    const existing = await this.getMyGroup(userId);
    if (existing) throw new ConflictException('Kamu sudah tergabung dalam grup');

    await this.members.save(
      this.members.create({
        groupId: invite.groupId,
        userId,
        role: GroupRole.MEMBER,
      }),
    );
    await this.claimPersonalData(userId, invite.groupId);
    await this.invites.update(invite.id, {
      status: InviteStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedById: userId,
    });
    return { success: true, groupId: invite.groupId };
  }

  async rejectInvite(userId: number, inviteId: number) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const invite = await this.invites.findOne({ where: { id: inviteId } });
    if (!invite || invite.status !== InviteStatus.PENDING)
      throw new NotFoundException('Undangan tidak ditemukan atau sudah diproses');
    if (invite.invitedUsername !== user.username)
      throw new ForbiddenException('Undangan ini bukan untukmu');

    await this.invites.update(invite.id, {
      status: InviteStatus.REJECTED,
      acceptedAt: new Date(),
      acceptedById: userId,
    });
    return { success: true };
  }

  async joinGroup(userId: number, dto: JoinGroupDto) {
    const existing = await this.getMyGroup(userId);
    if (existing) throw new ConflictException('Sudah tergabung dalam grup');

    const invite = await this.invites.findOne({
      where: { code: dto.code, status: InviteStatus.PENDING },
    });
    if (!invite)
      throw new NotFoundException(
        'Kode undangan tidak valid atau sudah dipakai',
      );

    await this.members.save(
      this.members.create({
        groupId: invite.groupId,
        userId,
        role: GroupRole.MEMBER,
      }),
    );
    await this.claimPersonalData(userId, invite.groupId);
    await this.invites.update(invite.id, {
      status: InviteStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedById: userId,
    });
    return { success: true, groupId: invite.groupId };
  }
  private async claimPersonalData(userId: number, groupId: number) {
    await this.expenses.update({ userId, groupId: IsNull() }, { groupId });
    await this.categories.update({ userId, groupId: IsNull() }, { groupId });
    await this.expenses.update({ userId, groupId: userId }, { groupId });
    await this.categories.update({ userId, groupId: userId }, { groupId });
  }
}
