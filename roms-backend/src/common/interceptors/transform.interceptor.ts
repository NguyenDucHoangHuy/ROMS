import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';

/**
 * Cấu trúc response chuẩn của toàn hệ thống ROMS.
 * Mọi API đều trả về đúng định dạng này.
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
}

/**
 * TransformInterceptor — Interceptor xử lý RESPONSE (sau khi Controller trả về).
 *
 * Tự động đóng gói payload thành ApiResponse chuẩn:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "OK",
 *   data: <payload gốc từ Service>,
 *   timestamp: "2026-09-03T...",
 *   path: "/api/v1/orders"
 * }
 *
 * Đăng ký global trong main.ts bằng app.useGlobalInterceptors(new TransformInterceptor()).
 * KHÔNG cần @UseInterceptors() ở từng Controller.
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        message: this.getDefaultMessage(response.statusCode),
        data: data ?? null,
        timestamp: new Date().toISOString(),
        path: request.url,
      })),
    );
  }

  /**
   * Trả về message mô tả mặc định theo HTTP status code.
   * Service có thể override bằng cách trả về object { message, data }.
   */
  private getDefaultMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      200: 'OK',
      201: 'Created successfully',
      204: 'No content',
    };
    return messages[statusCode] ?? 'Success';
  }
}
