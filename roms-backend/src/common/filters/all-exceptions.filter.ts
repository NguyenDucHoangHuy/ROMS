import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  message: string;
  errors: string[] | null;
  timestamp: string;
  path: string;
}

interface ExceptionDetails {
  statusCode: number;
  message: string;
  errors: string[] | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;

  const messages = value.filter(
    (item): item is string => typeof item === 'string',
  );
  return messages.length > 0 ? messages : null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') throw exception;

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const details = this.resolveException(exception);
    const path = request.path || request.url.split('?')[0];
    const logMessage = `[${request.method}] ${path} -> ${details.statusCode}: ${details.message}`;

    if (details.statusCode >= 500) {
      this.logger.error(
        logMessage,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(logMessage);
    }

    const body: ErrorResponseBody = {
      success: false,
      statusCode: details.statusCode,
      message: details.message,
      errors: details.errors,
      timestamp: new Date().toISOString(),
      path,
    };

    response.status(details.statusCode).json(body);
  }

  private resolveException(exception: unknown): ExceptionDetails {
    if (exception instanceof HttpException)
      return this.resolveHttpException(exception);

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data format sent to database',
        errors: null,
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
      errors: null,
    };
  }

  private resolveHttpException(exception: HttpException): ExceptionDetails {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return { statusCode, message: exceptionResponse, errors: null };
    }

    if (Array.isArray(exceptionResponse)) {
      return {
        statusCode,
        message: 'Validation failed',
        errors: getStringArray(exceptionResponse),
      };
    }

    if (isRecord(exceptionResponse)) {
      const message = exceptionResponse.message;
      const errors =
        getStringArray(exceptionResponse.errors) ?? getStringArray(message);

      if (errors) return { statusCode, message: 'Validation failed', errors };

      return {
        statusCode,
        message: typeof message === 'string' ? message : exception.message,
        errors: null,
      };
    }

    return { statusCode, message: exception.message, errors: null };
  }

  private resolvePrismaError(
    error: Prisma.PrismaClientKnownRequestError,
  ): ExceptionDetails {
    switch (error.code) {
      case 'P2002':
        return {
          statusCode: HttpStatus.CONFLICT,
          message: 'A record with the provided information already exists',
          errors: null,
        };
      case 'P2003':
      case 'P2014':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The request references related data that cannot be used',
          errors: null,
        };
      case 'P2016':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'The request could not be interpreted',
          errors: null,
        };
      case 'P2025':
        return {
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          errors: null,
        };
      default:
        this.logger.error(`Unhandled Prisma error code: ${error.code}`);
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred',
          errors: null,
        };
    }
  }
}
