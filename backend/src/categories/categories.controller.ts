import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthedRequest } from '../auth/jwt-payload.interface';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categories: CategoriesService) {}

  @Get()
  findAll(@Req() req: AuthedRequest) {
    return this.categories.findAll(req.user.id);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateCategoryDto) {
    return this.categories.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categories.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.categories.remove(req.user.id, id);
  }
}
