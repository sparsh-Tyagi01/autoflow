import { Request, Response, NextFunction } from 'express'

import jwt from 'jsonwebtoken'

export interface AuthRequest
  extends Request {
  userId?: string
}

export function protect(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
      })
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: string
    }

    req.userId = decoded.userId

    next()
  } catch (error) {
    return res.status(401).json({
      message: 'Unauthorized',
    })
  }
}