import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from '@upstash/redis';
import { getRedisConfig } from './redis.config';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    try {
      const config = getRedisConfig(this.configService);
      this.redis = new Redis({
        url: config.url,
        token: config.token,
      });
      this.logger.log('Redis connection initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Redis connection', error);
    }
  }

  // Basic operations
  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const serializedValue = this.serializeValue(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serializedValue);
      } else {
        await this.redis.set(key, serializedValue);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}`, error);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? this.deserializeValue<T>(value as string) : null;
    } catch (error) {
      this.logger.error(`Failed to get key ${key}`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}`, error);
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: any): Promise<void> {
    try {
      await this.redis.hset(key, { [field]: this.serializeValue(value) });
    } catch (error) {
      this.logger.error(`Failed to hset key ${key}, field ${field}`, error);
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await this.redis.hget(key, field);
      return value ? this.deserializeValue<T>(value as string) : null;
    } catch (error) {
      this.logger.error(`Failed to hget key ${key}, field ${field}`, error);
      return null;
    }
  }

  async hgetall<T>(key: string): Promise<Record<string, T>> {
    try {
      const result = await this.redis.hgetall(key);
      if (!result) return {};
      
      const parsed: Record<string, T> = {};
      for (const [field, value] of Object.entries(result)) {
        const deserializedValue = this.deserializeValue<T>(value as string);
        if (deserializedValue !== null) {
          parsed[field] = deserializedValue;
        }
      }
      return parsed;
    } catch (error) {
      this.logger.error(`Failed to hgetall key ${key}`, error);
      return {};
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.redis.hdel(key, field);
    } catch (error) {
      this.logger.error(`Failed to hdel key ${key}, field ${field}`, error);
    }
  }

  // List operations
  async lpush(key: string, ...values: any[]): Promise<void> {
    try {
      const stringValues = values.map(v => this.serializeValue(v));
      await this.redis.lpush(key, stringValues);
    } catch (error) {
      this.logger.error(`Failed to lpush key ${key}`, error);
    }
  }

  async rpush(key: string, ...values: any[]): Promise<void> {
    try {
      const stringValues = values.map(v => this.serializeValue(v));
      await this.redis.rpush(key, stringValues);
    } catch (error) {
      this.logger.error(`Failed to rpush key ${key}`, error);
    }
  }

  async lpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.lpop(key);
      return value ? this.deserializeValue<T>(value as string) : null;
    } catch (error) {
      this.logger.error(`Failed to lpop key ${key}`, error);
      return null;
    }
  }

  async rpop<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.rpop(key);
      return value ? this.deserializeValue<T>(value as string) : null;
    } catch (error) {
      this.logger.error(`Failed to rpop key ${key}`, error);
      return null;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await this.redis.lrange(key, start, stop);
      return values
        .map(v => this.deserializeValue<T>(v as string))
        .filter((item): item is T => item !== null);
    } catch (error) {
      this.logger.error(`Failed to lrange key ${key}`, error);
      return [];
    }
  }

  // Set operations
  async sadd(key: string, ...members: any[]): Promise<void> {
    try {
      const stringMembers = members.map(m => this.serializeValue(m));
      await this.redis.sadd(key, stringMembers);
    } catch (error) {
      this.logger.error(`Failed to sadd key ${key}`, error);
    }
  }

  async smembers<T>(key: string): Promise<T[]> {
    try {
      const members = await this.redis.smembers(key);
      return members
        .map(m => this.deserializeValue<T>(m as string))
        .filter((item): item is T => item !== null);
    } catch (error) {
      this.logger.error(`Failed to smembers key ${key}`, error);
      return [];
    }
  }

  async srem(key: string, ...members: any[]): Promise<void> {
    try {
      const stringMembers = members.map(m => this.serializeValue(m));
      await this.redis.srem(key, stringMembers);
    } catch (error) {
      this.logger.error(`Failed to srem key ${key}`, error);
    }
  }

  // TTL operations
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.redis.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Failed to expire key ${key}`, error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get ttl for key ${key}`, error);
      return -1;
    }
  }

  // Pattern matching
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}`, error);
      return [];
    }
  }

  // Flush operations
  async flushall(): Promise<void> {
    try {
      await this.redis.flushall();
      this.logger.warn('Redis database flushed');
    } catch (error) {
      this.logger.error('Failed to flush Redis database', error);
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping failed', error);
      return false;
    }
  }

  // Helper methods for safe serialization
  private serializeValue(value: any): string {
    try {
      const seen = new WeakSet();
      
      // Handle circular references and non-serializable values
      return JSON.stringify(value, (key, val) => {
        // Skip functions and undefined values
        if (typeof val === 'function' || val === undefined) {
          return null;
        }
        
        // Handle Date objects
        if (val instanceof Date) {
          return val.toISOString();
        }
        
        // Handle circular references
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }
        
        return val;
      });
    } catch (error) {
      this.logger.error('Failed to serialize value', error);
      return JSON.stringify({ error: 'Serialization failed' });
    }
  }

  private deserializeValue<T>(value: any): T | null {
    try {
      if (!value) return null;
  
      // If it's already an object, return it directly
      if (typeof value === 'object') {
        return value as T;
      }
  
      // Handle corrupted or invalid cache strings
      if (value === '[object Object]') {
        this.logger.warn('Encountered corrupted cache value, skipping');
        return null;
      }
  
      // Parse valid JSON strings
      if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
        return JSON.parse(value);
      }
  
      this.logger.warn('Value is not valid JSON, skipping');
      return null;
    } catch (error) {
      this.logger.error('Failed to deserialize value', error);
      return null;
    }
  }
}
