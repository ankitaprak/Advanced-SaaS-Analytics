import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { env } from '../config/env.js'

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      })
      return
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      })
      return
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Token is missing',
      })
      return
    }

    const decoded = jwt.verify(
      token,
      env.jwtSecret,
    ) as {
      userId: string
      role: 'Admin' | 'Manager' | 'Viewer'
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)

    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }
}