import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthedRequest } from './jwt-payload.interface';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new BadRequestException('Token tidak ada');

    try {
      const payload = await this.jwt.verifyAsync<{
        sub: number;
        email: string;
      }>(token);
      req.user = { id: payload.sub, email: payload.email };
      return true;
    } catch {
      throw new BadRequestException('Token tidak valid');
    }
  }
}
