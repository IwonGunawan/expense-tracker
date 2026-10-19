import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import {
  Group,
  GroupMember,
  GroupRole,
  GroupInvite,
  InviteStatus,
} from '../entities';
import { User } from '../entities/user.entity';
import { CreateGroupDto, InviteUserDto, JoinGroupDto } from './dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private groups: Repository<Group>,
    @InjectRepository(GroupMember) private members: Repository<GroupMember>,
    @InjectRepository(GroupInvite) private invites: Repository<GroupInvite>,
    @InjectRepository(User) private users: Repository<User>,
  ) {}

  async getMyGroup(userId: number) {
    const member = await this.members.findOne({
      where: { userId },
      relations: { group: true },
    });
    if (!member) return null;
    return member.group;
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
    return group;
  }

  async leaveGroup(userId: number) {
    const member = await this.members.findOne({
      where: { userId },
      relations: { group: true },
    });
    if (!member) throw new NotFoundException('Tidak tergabung dalam grup');
    if (member.role === GroupRole.OWNER)
      throw new ForbiddenException('Owner tidak bisa keluar grup');
    await this.members.remove(member);
    return { success: true };
  }

  async inviteUser(userId: number, dto: InviteUserDto) {
    const inviter = await this.members.findOne({ where: { userId } });
    if (!inviter)
      throw new ForbiddenException(
        'Harus tergabung dalam grup untuk mengundang',
      );

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
    await this.invites.update(invite.id, {
      status: InviteStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedById: userId,
    });
    return { success: true, groupId: invite.groupId };
  }
}
