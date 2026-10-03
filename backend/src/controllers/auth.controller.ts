import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/User.js'
import { env } from '../config/env.js'

export const register = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      })
      return
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      })
      return
    }

    const existingUser = await User.findOne({
      email,
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      })
      return
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10,
    )

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Viewer',
    })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Register error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    })
  }
}

export const login = async (
  req: Request,
  res: Response,
) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      })
      return
    }

    const user = await User.findOne({ email })

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    if (user.status === 'Inactive') {
      res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      })
      return
    }

    const isPasswordValid =
      await bcrypt.compare(
        password,
        user.password,
      )

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      })
      return
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      env.jwtSecret,
      {
        expiresIn: '1d',
      },
    )

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to login',
    })
  }
}