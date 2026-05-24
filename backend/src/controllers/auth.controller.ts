import { Request, Response } from 'express'

import bcrypt from 'bcryptjs'

import { User } from '../models/user.model'

import { generateToken } from '../utils/generate-token'

export async function register(
  req: Request,
  res: Response
) {
  try {
    const { name, email, password } =
      req.body

    const existingUser = await User.findOne({
      email,
    })

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    const token = generateToken(
      user._id.toString()
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })

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
    const { email, password } =
      req.body

    const user = await User.findOne({
      email,
    })

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials',
      })
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!validPassword) {
      return res.status(400).json({
        message: 'Invalid credentials',
      })
    }

    const token = generateToken(
      user._id.toString()
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    })

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

export async function logout(
  req: Request,
  res: Response
) {
  res.cookie('token', '', {
    expires: new Date(0),
  })

  return res.json({
    message: 'Logged out',
  })
}