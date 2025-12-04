import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from './cache.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
  CACHE_PREFIX_METADATA,
} from './cache.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTtl = this.reflector.get<number>(
      CACHE_TTL_METADATA,
      context.getHandler(),
    );
    const cachePrefix = this.reflector.get<string>(
      CACHE_PREFIX_METADATA,
      context.getHandler(),
    );

    if (!cacheKey) {
      return next.handle();
    }

    // Build dynamic cache key based on request parameters
    const dynamicKey = this.buildCacheKey(cacheKey, request, cachePrefix);

    try {
      // Try to get from cache
      const cachedResult = await this.cacheService.get(dynamicKey, {
        ttl: cacheTtl,
        prefix: cachePrefix,
      });

      if (cachedResult !== null) {
        this.logger.debug(`Cache hit for key: ${dynamicKey}`);
        return of(cachedResult);
      }

      // Cache miss, execute the method and cache the result
      this.logger.debug(`Cache miss for key: ${dynamicKey}`);
      return next.handle().pipe(
        tap(async (data) => {
          try {
            await this.cacheService.set(dynamicKey, data, {
              ttl: cacheTtl,
              prefix: cachePrefix,
            });
            this.logger.debug(`Cached result for key: ${dynamicKey}`);
          } catch (error) {
            this.logger.error(`Failed to cache result for key: ${dynamicKey}`, error);
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Cache operation failed for key: ${dynamicKey}`, error);
      return next.handle();
    }
  }

  private buildCacheKey(
    baseKey: string,
    request: any,
    prefix?: string,
  ): string {
    let key = baseKey;

    // Add user ID if available
    if (request.user?.id) {
      key += `:user:${request.user.id}`;
    }

    // Add query parameters
    if (request.query && Object.keys(request.query).length > 0) {
      const queryString = Object.entries(request.query)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      key += `:query:${Buffer.from(queryString).toString('base64')}`;
    }

    // Add path parameters
    if (request.params && Object.keys(request.params).length > 0) {
      const paramsString = Object.entries(request.params)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      key += `:params:${Buffer.from(paramsString).toString('base64')}`;
    }

    return prefix ? `${prefix}:${key}` : key;
  }
}
