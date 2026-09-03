import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

/**
 * AllExceptionsFilter — Exception Filter toàn cục của hệ thống ROMS.
 *
 * Bắt và chuẩn hoá MỌI loại lỗi về cùng 1 cấu trúc:
 * {
 *   success: false,
 *   statusCode: 4xx | 5xx,
 *   message: "Mô tả lỗi",
 *   errors: [...] | null,   ← ValidationPipe trả về mảng lỗi chi tiết
 *   timestamp: "2026-...",
 *   path: "/api/v1/..."
 * }
 *
 * Xử lý 3 nhóm lỗi:
 *  1. HttpException (NestJS) — 400 BadRequest, 401 Unauthorized, 403 Forbidden, 404 NotFound...
 *  2. Prisma Client Errors — lỗi database (unique constraint, not found, FK violation...)
 *  3. Unknown Error — lỗi không xác định → 500 Internal Server Error
 *
 * Đăng ký global trong main.ts bằng app.useGlobalFilters(new AllExceptionsFilter()).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, errors } = this.resolveException(exception);

    // Log lỗi — 5xx log ở level error, 4xx log ở level warn
    if (statusCode >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${statusCode}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${statusCode}: ${message}`,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors: errors ?? null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private resolveException(exception: unknown): {
    statusCode: number;
    message: string;
    errors?: string[];
  } {
    // ── 1. NestJS HttpException (bao gồm ValidationPipe 400) ──────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // ValidationPipe trả về object { message: string[], error: string }
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as Record<string, unknown>).message;
        if (Array.isArray(msg)) {
          return {
            statusCode: status,
            message: 'Validation failed',
            errors: msg as string[],
          };
        }
        return {
          statusCode: status,
          message: String(msg),
        };
      }

      return {
        statusCode: status,
        message:
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exception.message,
      };
    }

    // ── 2. Prisma Known Request Errors ────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    // ── 3. Prisma Validation Errors (schema mismatch) ─────────────────────────
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data format sent to database',
      };
    }

    // ── 4. Unknown / Unexpected Error ─────────────────────────────────────────
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
    };
  }

  /**
   * Dịch Prisma error code thành HTTP response thân thiện.
   * Tham khảo: https://www.prisma.io/docs/reference/api-reference/error-reference
   */
  private resolvePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    message: string;
  } {
    switch (error.code) {
      // P2002: Unique constraint violation
      case 'P2002': {
        const fields = (error.meta?.target as string[])?.join(', ') ?? 'field';
        return {
          statusCode: HttpStatus.CONFLICT,
          message: `A record with this ${fields} already exists`,
        };
      }

      // P2025: Record not found (findUniqueOrThrow, updateOrThrow...)
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: (error.meta?.cause as string) ?? 'Record not found',
        };

      // P2003: Foreign key constraint violation
      case 'P2003':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Related record does not exist (foreign key constraint)',
        };

      // P2014: Required relation violation
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'This operation would violate a required relation',
        };

      // P2016: Query interpretation error
      case 'P2016':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Query interpretation error',
        };

      default:
        this.logger.error(`Unhandled Prisma error code: ${error.code}`, error);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
        };
    }
  }
}
