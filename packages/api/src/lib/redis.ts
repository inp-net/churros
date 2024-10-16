import { Redis } from 'ioredis';
import { ENV } from './env.js';

let _redisClient: Redis;
function redisClient(): Redis {
  if (_redisClient) return _redisClient;
  const redisURL = new URL(ENV.REDIS_URL || 'redis://localhost:6379');
  return (_redisClient = new Redis({
    host: redisURL.hostname,
    port: Number.parseInt(redisURL.port),
  }));
}

export { redisClient };
