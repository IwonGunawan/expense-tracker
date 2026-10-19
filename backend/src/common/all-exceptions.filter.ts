import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const status = this.getStatus(exception);
    const message = this.getMessage(exception);

    this.logger.error(
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    response.status(status).json({
      statusCode: status,
      error: this.getErrorName(status),
      message,
      path: request.url,
    });
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) return exception.getStatus();
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') return res;
      if (res && typeof res === 'object') {
        const obj = res as Record<string, unknown>;
        if (obj.message) return obj.message as string | string[];
      }
      return exception.message;
    }

    if (exception instanceof QueryFailedError) {
      return this.mapQueryError(exception);
    }

    if (exception instanceof Error) {
      if (exception.name === 'JsonWebTokenError') return 'Token tidak valid';
      if (exception.name === 'TokenExpiredError')
        return 'Sesi berakhir, silakan login ulang';
      return 'Terjadi kesalahan pada server';
    }

    return 'Terjadi kesalahan pada server';
  }

  private mapQueryError(exception: QueryFailedError): string {
    const driverError = (
      exception as unknown as {
        driverError?: { code?: string; message?: string; sqlMessage?: string };
      }
    ).driverError;
    const code = driverError?.code;
    const message = driverError?.message || driverError?.sqlMessage;

    switch (code) {
      case 'ER_DUP_ENTRY':
        return 'Data sudah ada (duplikat)';
      case 'ER_NO_REFERENCED_ROW_2':
        return 'Relasi data tidak valid';
      case 'ER_ROW_IS_REFERENCED_2':
        return 'Data masih dipakai di tempat lain, tidak bisa dihapus';
      case 'ER_BAD_NULL_ERROR':
        return 'Data wajib tidak boleh kosong';
      case 'ER_DATA_TOO_LONG':
        return 'Data terlalu panjang';
      case 'ER_PARSE_ERROR':
      case 'ER_SYNTAX_ERROR':
        return 'Terjadi kesalahan query database';
      default:
        return message || 'Terjadi kesalahan pada database';
    }
  }

  private getErrorName(status: number): string {
    if (status === 400) return 'Bad Request';
    if (status === 401) return 'Unauthorized';
    if (status === 403) return 'Forbidden';
    if (status === 404) return 'Not Found';
    if (status === 409) return 'Conflict';
    if (status >= 500) return 'Internal Server Error';
    return 'Error';
  }
}
