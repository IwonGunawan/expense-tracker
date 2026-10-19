import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthedRequest } from '../auth/jwt-payload.interface';
import { CreateGroupDto, InviteUserDto, JoinGroupDto } from './dto';
import { GroupsService } from './groups.service';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get('me')
  getMyGroup(@Req() req: AuthedRequest) {
    return this.groups.getMyGroup(req.user.id);
  }

  @Post()
  createGroup(@Req() req: AuthedRequest, @Body() dto: CreateGroupDto) {
    return this.groups.createGroup(req.user.id, dto);
  }

  @Post('invite')
  inviteUser(@Req() req: AuthedRequest, @Body() dto: InviteUserDto) {
    return this.groups.inviteUser(req.user.id, dto);
  }

  @Get('invites')
  listInvites(@Req() req: AuthedRequest) {
    return this.groups.listInvites(req.user.id);
  }

  @Post('join')
  joinGroup(@Req() req: AuthedRequest, @Body() dto: JoinGroupDto) {
    return this.groups.joinGroup(req.user.id, dto);
  }
}
