import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthedRequest } from '../auth/jwt-payload.interface';
import {
  CreateExpenseDto,
  QueryExpenseDto,
  QueryMonthlyDto,
  UpdateExpenseDto,
} from './dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get()
  findAll(@Req() req: AuthedRequest, @Query() q: QueryExpenseDto) {
    return this.expenses.findAll(req.user.id, q);
  }

  @Get('summary')
  summary(@Req() req: AuthedRequest, @Query() q: QueryExpenseDto) {
    return this.expenses.summary(req.user.id, q);
  }

  @Get('monthly')
  monthly(@Req() req: AuthedRequest, @Query() q: QueryMonthlyDto) {
    return this.expenses.monthly(req.user.id, q);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(req.user.id, dto);
  }

  @Patch(':id')
  update(
    @Req() req: AuthedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: AuthedRequest, @Param('id', ParseIntPipe) id: number) {
    return this.expenses.remove(req.user.id, id);
  }
}
