import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T | null;
  timestamp: string;
  path: string;
}

interface MessageDataPayload {
  message: string;
  data: unknown;
}

function isMessageDataPayload(value: unknown): value is MessageDataPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).message === 'string' &&
    'data' in value
  );
}

function isBinaryResponse(value: unknown): boolean {
  return (
    value instanceof StreamableFile ||
    Buffer.isBuffer(value) ||
    value instanceof Readable
  );
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<unknown> | T | undefined
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<unknown> | T | undefined> {
    if (context.getType() !== 'http') return next.handle();

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<
      Response & { statusCode: number }
    >();

    return next.handle().pipe(
      map((data: T) => {
        if (response.statusCode === 204) return undefined;
        if (isBinaryResponse(data)) return data;

        const hasCustomMessage = isMessageDataPayload(data);
        const payload = hasCustomMessage ? data.data : data;

        return {
          success: true,
          statusCode: response.statusCode,
          message: hasCustomMessage
            ? data.message
            : this.getDefaultMessage(response.statusCode),
          data: payload ?? null,
          timestamp: new Date().toISOString(),
          path: request.url.split('?')[0],
        } satisfies ApiResponse<unknown>;
      }),
    );
  }

  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      200: 'OK',
      201: 'Created successfully',
      202: 'Accepted',
      204: 'No content',
    };

    return messages[statusCode] ?? 'Success';
  }
}
