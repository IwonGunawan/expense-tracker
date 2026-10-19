import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
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

  @Get('invites/received')
  listReceivedInvites(@Req() req: AuthedRequest) {
    return this.groups.listReceivedInvites(req.user.id);
  }

  @Get('members')
  listMembers(@Req() req: AuthedRequest) {
    return this.groups.listMembers(req.user.id);
  }

  @Post('invites/:id/accept')
  acceptInvite(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.groups.acceptInvite(req.user.id, id);
  }

  @Post('invites/:id/reject')
  rejectInvite(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.groups.rejectInvite(req.user.id, id);
  }

  @Post('join')
  joinGroup(@Req() req: AuthedRequest, @Body() dto: JoinGroupDto) {
    return this.groups.joinGroup(req.user.id, dto);
  }
}
