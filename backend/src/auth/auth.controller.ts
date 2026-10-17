import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthedRequest } from './jwt-payload.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ChangePasswordDto,
  DeleteAccountDto,
  LoginDto,
  RegisterDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: AuthedRequest) {
    return this.auth.me(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('me/password')
  changePassword(@Req() req: AuthedRequest, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('me')
  remove(@Req() req: AuthedRequest, @Body() dto: DeleteAccountDto) {
    return this.auth.deleteAccount(req.user.id, dto);
  }
}
