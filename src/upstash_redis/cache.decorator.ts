import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';
export const CACHE_PREFIX_METADATA = 'cache_prefix';

export interface CacheDecoratorOptions {
  key?: string;
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

export const Cacheable = (options: CacheDecoratorOptions = {}) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options.key || propertyName)(target, propertyName, descriptor);
    SetMetadata(CACHE_TTL_METADATA, options.ttl)(target, propertyName, descriptor);
    SetMetadata(CACHE_PREFIX_METADATA, options.prefix)(target, propertyName, descriptor);
    return descriptor;
  };
};

export const CacheEvict = (options: CacheDecoratorOptions = {}) => {
  return (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options.key || propertyName)(target, propertyName, descriptor);
    SetMetadata(CACHE_PREFIX_METADATA, options.prefix)(target, propertyName, descriptor);
    return descriptor;
  };
};
