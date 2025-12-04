import { ConfigService } from '@nestjs/config';

export interface RedisConfig {
  url: string;
  token: string;
}

export const getRedisConfig = (configService: ConfigService): RedisConfig => {
  return {
    url: configService.get<string>('UPSTASH_REDIS_URL') || '',
    token: configService.get<string>('UPSTASH_REDIS_TOKEN') || '',
  };
};
