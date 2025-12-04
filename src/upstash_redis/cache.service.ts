import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 300; // 5 minutes default

  constructor(private readonly redisService: RedisService) {}

  // Generic cache operations
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.prefix);
    return await this.redisService.get<T>(fullKey);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl || this.defaultTTL;
    await this.redisService.set(fullKey, value, ttl);
  }

  async del(key: string, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    await this.redisService.del(fullKey);
  }

  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.buildKey(key, options?.prefix);
    return await this.redisService.exists(fullKey);
  }

  // Cache with fallback function
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options?: CacheOptions
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      this.logger.debug(`Cache hit for key: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss for key: ${key}, executing fallback`);
    const result = await fallbackFn();
    await this.set(key, result, options);
    return result;
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redisService.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redisService.del(key)));
      this.logger.debug(`Invalidated ${keys.length} keys matching pattern: ${pattern}`);
    }
  }

  // Specific cache operations for your app
  async cacheNearbyStores(
    customerId: string,
    latitude: number,
    longitude: number,
    stores: any[],
    ttl: number = 600 // 10 minutes
  ): Promise<void> {
    const key = `nearby_stores:${customerId}:${latitude}:${longitude}`;
    await this.set(key, stores, { ttl });
  }

  async getNearbyStores(
    customerId: string,
    latitude: number,
    longitude: number
  ): Promise<any[] | null> {
    const key = `nearby_stores:${customerId}:${latitude}:${longitude}`;
    return await this.get<any[]>(key);
  }

  async cacheProducts(
    storeIds: string[],
    products: any[],
    ttl: number = 300 // 5 minutes
  ): Promise<void> {
    const key = `products:stores:${storeIds.sort().join(',')}`;
    await this.set(key, products, { ttl });
  }

  async getCachedProducts(storeIds: string[]): Promise<any[] | null> {
    const key = `products:stores:${storeIds.sort().join(',')}`;
    return await this.get<any[]>(key);
  }

  async cacheCustomerAddress(
    customerId: string,
    address: any,
    ttl: number = 1800 // 30 minutes
  ): Promise<void> {
    const key = `customer_address:${customerId}`;
    await this.set(key, address, { ttl });
  }

  async getCachedCustomerAddress(customerId: string): Promise<any | null> {
    const key = `customer_address:${customerId}`;
    return await this.get<any>(key);
  }

  // Cart cache operations
  async cacheCart(customerId: string, cartData: any, ttl: number = 1800): Promise<void> {
    const key = `cart:${customerId}`;
    await this.set(key, cartData, { ttl });
  }

  async getCachedCart(customerId: string): Promise<any | null> {
    const key = `cart:${customerId}`;
    return await this.get<any>(key);
  }

  async invalidateCart(customerId: string): Promise<void> {
    const key = `cart:${customerId}`;
    await this.del(key);
  }

  // Cache warming
  async warmCache(customerId: string, data: any): Promise<void> {
    const keys = [
      `customer_address:${customerId}`,
      `nearby_stores:${customerId}:*`,
      `products:stores:*`
    ];

    for (const keyPattern of keys) {
      await this.invalidatePattern(keyPattern);
    }

    // Pre-populate with new data
    if (data.address) {
      await this.cacheCustomerAddress(customerId, data.address);
    }
  }

  // Utility methods
  private buildKey(key: string, prefix?: string): string {
    return prefix ? `${prefix}:${key}` : key;
  }

  // Cache statistics
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    const allKeys = await this.redisService.keys('*');
    return {
      totalKeys: allKeys.length,
      memoryUsage: 'N/A', // Upstash doesn't provide memory usage directly
    };
  }
}
