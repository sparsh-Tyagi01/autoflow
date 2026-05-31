import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function connectRedis(): Promise<RedisClientType | null> {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  try {
    redisClient = createClient({
      url: redisUrl,
    }) as RedisClientType

    redisClient.on('error', (err) => {
      console.error('Redis error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis client connecting...')
    })

    redisClient.on('ready', () => {
      console.log('Redis connected and ready')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    redisClient = null
    return null
  }
}

export function getRedisClient(): RedisClientType | null {
  return redisClient
}

// Get cache item helper
export async function getCache(key: string): Promise<string | null> {
  if (!redisClient || !redisClient.isOpen) return null
  try {
    return await redisClient.get(key)
  } catch (err) {
    console.error(`Redis get cache error for key ${key}:`, err)
    return null
  }
}

// Set cache item helper with dynamic TTL
export async function setCache(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  if (!redisClient || !redisClient.isOpen) return
  try {
    if (ttlSeconds) {
      await redisClient.setEx(key, ttlSeconds, value)
    } else {
      await redisClient.set(key, value)
    }
  } catch (err) {
    console.error(`Redis set cache error for key ${key}:`, err)
  }
}

// Invalidate key helper
export async function invalidateCache(key: string): Promise<void> {
  if (!redisClient || !redisClient.isOpen) return
  try {
    await redisClient.del(key)
  } catch (err) {
    console.error(`Redis del cache error for key ${key}:`, err)
  }
}

// Blacklist JWT helper
export async function blacklistToken(
  token: string,
  ttlSeconds: number = 7 * 24 * 60 * 60
): Promise<void> {
  const key = `blacklist:${token}`
  await setCache(key, 'true', ttlSeconds)
}

// Check if token is blacklisted helper
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const key = `blacklist:${token}`
  const cached = await getCache(key)
  return cached === 'true'
}
