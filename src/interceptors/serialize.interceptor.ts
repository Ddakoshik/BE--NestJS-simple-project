import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export function Serialize(dto: any) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data: any) => {
        console.log(data);
        return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        });
      }),
    );
  }
}
