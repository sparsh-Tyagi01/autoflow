import { Request, Response } from 'express'

import bcrypt from 'bcryptjs'

import { z } from 'zod/v4'

import { User } from '../models/user.model'

import { generateToken } from '../utils/generate-token'

import { AuthRequest } from '../middleware/auth.middleware'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

function setTokenCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export async function register(
  req: Request,
  res: Response
) {
  try {
    const parsed = registerSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((i) => i.message),
      })
    }

    const { name, email, password } = parsed.data

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = generateToken(user._id.toString())

    setTokenCookie(res, token)

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export async function login(
  req: Request,
  res: Response
) {
  try {
    const parsed = loginSchema.safeParse(req.body)

    if (!parsed.success) {
      return res.status(400).json({
        message: 'Validation error',
        errors: parsed.error.issues.map((i) => i.message),
      })
    }

    const { email, password } = parsed.data

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(400).json({
        message: 'Invalid credentials',
      })
    }

    const token = generateToken(user._id.toString())

    setTokenCookie(res, token)

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

import { blacklistToken } from '../database/redis'

export async function logout(
  req: Request,
  res: Response
) {
  try {
    const token = req.cookies.token
    if (token) {
      // Blacklist token for 7 days (matching setTokenCookie maxAge)
      await blacklistToken(token, 7 * 24 * 60 * 60)
    }
  } catch (error) {
    console.error('Failed to blacklist token:', error)
  }

  res.cookie('token', '', {
    expires: new Date(0),
  })

  return res.json({
    message: 'Logged out',
  })
}

export async function getMe(
  req: AuthRequest,
  res: Response
) {
  try {
    const user = await User.findById(req.userId).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}