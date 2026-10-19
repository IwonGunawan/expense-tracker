import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from '../entities';

export function scopeOf(groupId: number | null, userId: number): number {
  return groupId ?? userId;
}

export async function resolveScope(
  members: Repository<GroupMember>,
  userId: number,
): Promise<number> {
  const member = await members.findOne({ where: { userId } });
  return member ? member.groupId : userId;
}
