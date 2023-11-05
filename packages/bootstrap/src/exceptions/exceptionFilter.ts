import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Observable, throwError } from "rxjs";
import { HttpStatusCode } from "../constants";
import { status } from "@grpc/grpc-js";
import { Response } from "express";

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  override catch(exception: HttpException, host: ArgumentsHost): Observable<never> | void {
    const httpStatus = exception.getStatus();

    if (host.getType() === "rpc") {
      // Transform http errors to rpc errors
      const httpRes = exception.getResponse() as { details?: unknown };
      return throwError(() => ({
        code: HttpStatusCode[httpStatus] ?? status.UNKNOWN,
        message: exception.message,
        details: Array.isArray(httpRes.details) ? httpRes.details : undefined
      }));
    } else if (host.getType() === "http") {
      // Just send the error as response
      // when in http context
      const response = host.switchToHttp().getResponse<Response>();
      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: exception.message
      });
      return;
    }
  }
}
