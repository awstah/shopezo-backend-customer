# Upstash Redis Integration

This module provides Redis caching functionality using Upstash Redis for the Shopezo backend.

## Setup

1. Install the required package:
```bash
npm install @upstash/redis
```

2. Add environment variables to your `.env` file:
```env
UPSTASH_REDIS_URL=your_upstash_redis_url
UPSTASH_REDIS_TOKEN=your_upstash_redis_token
```

3. The Redis module is already imported in `app.module.ts` and available globally.

## Features

### RedisService
- Basic operations: `set`, `get`, `del`, `exists`
- Hash operations: `hset`, `hget`, `hgetall`, `hdel`
- List operations: `lpush`, `rpush`, `lpop`, `rpop`, `lrange`
- Set operations: `sadd`, `smembers`, `srem`
- TTL operations: `expire`, `ttl`
- Pattern matching: `keys`
- Health check: `ping`

### CacheService
- Generic caching with TTL support
- Cache with fallback function (`getOrSet`)
- Pattern-based cache invalidation
- Specialized methods for:
  - Customer addresses
  - Nearby stores
  - Products by store
- Cache warming and statistics

### Cache Decorators
- `@Cacheable()` - Cache method results
- `@CacheEvict()` - Evict cache entries

### Cache Interceptor
- Automatic caching for methods decorated with `@Cacheable`
- Dynamic cache key generation based on request parameters
- Automatic cache population and retrieval

## Usage Examples

### Basic Caching
```typescript
// Inject CacheService
constructor(private readonly cacheService: CacheService) {}

// Cache data
await this.cacheService.set('user:123', userData, { ttl: 300 });

// Retrieve cached data
const userData = await this.cacheService.get('user:123');
```

### Cache with Fallback
```typescript
const products = await this.cacheService.getOrSet(
  'products:featured',
  () => this.productService.getFeaturedProducts(),
  { ttl: 600 }
);
```

### Method-level Caching
```typescript
@Cacheable({ key: 'best-selling', ttl: 300 })
async getBestSelling() {
  // Method implementation
}
```

## Cache Keys Used

- `customer_address:{customerId}` - Customer primary address
- `nearby_stores:{lat}:{lng}:{radius}:{details}` - Nearby stores
- `products:stores:{storeIds}` - Products from specific stores
- `user:{userId}:*` - User-related cache entries

## Performance Benefits

- **Reduced Database Load**: Cached queries reduce database hits
- **Faster Response Times**: Redis provides sub-millisecond access
- **Location-based Caching**: Store and product queries are cached by location
- **Automatic Invalidation**: TTL-based cache expiration
- **Fallback Strategy**: Graceful degradation when cache is unavailable

## Monitoring

Use the `getCacheStats()` method to monitor cache performance:
```typescript
const stats = await this.cacheService.getCacheStats();
console.log(`Total keys: ${stats.totalKeys}`);
```
