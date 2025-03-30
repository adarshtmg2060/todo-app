import { createClient, RedisClientType } from 'redis';

class RedisService {
  private client: RedisClientType;
  private static instance: RedisService;
  private isConnected = false;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    this.client.on('error', (err) => console.error('Redis Client Error', err));
    this.client.on('connect', () => console.log('Redis Client Connected'));
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  // Todo-specific cache methods
  public async cacheTodos(key: string, todos: any[], ttl: number = 3600): Promise<void> {
    await this.client.setEx(`todos:${key}`, ttl, JSON.stringify(todos));
  }

  public async getCachedTodos(key: string): Promise<any[] | null> {
    const cachedData = await this.client.get(`todos:${key}`);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  public async invalidateTodosCache(): Promise<void> {
    const keys = await this.client.keys('todos:*');
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }

  // General cache methods
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setEx(key, ttl, JSON.stringify(value));
    } else {
      await this.client.set(key, JSON.stringify(value));
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    const cachedData = await this.client.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  }

  public async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}

export const redisService = RedisService.getInstance();