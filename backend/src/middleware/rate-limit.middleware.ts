import { Request, Response, NextFunction } from 'express'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetTime) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export function rateLimit(options: {
  windowMs?: number
  max?: number
  message?: string
} = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 60,              // 60 requests per window
    message = 'Too many requests, please try again later.',
  } = options

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    let entry = store.get(key)

    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store.set(key, entry)
    }

    entry.count++

    res.setHeader('X-RateLimit-Limit', max.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count).toString())
    res.setHeader('X-RateLimit-Reset', entry.resetTime.toString())

    if (entry.count > max) {
      return res.status(429).json({ message })
    }

    next()
  }
}
