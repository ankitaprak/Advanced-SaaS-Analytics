import type { Request, Response } from 'express'

import User from '../models/User.js'
import { hashPassword } from '../utils/password.js'
import { createActivityLog } from '../services/activityLog.service.js'

const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const validRoles = ['Admin', 'Manager', 'Viewer'] as const
const validStatuses = ['Active', 'Inactive'] as const

export const getUsers = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      search,
      role,
      status,
      page = '1',
      limit = '10',
    } = req.query

    const pageNumber = Math.max(
      Number(page) || 1,
      1,
    )

    const limitNumber = Math.min(
      Math.max(Number(limit) || 10, 1),
      50,
    )

    const filter: Record<string, unknown> = {}

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: String(search),
            $options: 'i',
          },
        },
        {
          email: {
            $regex: String(search),
            $options: 'i',
          },
        },
      ]
    }

    if (role) {
      filter.role = role
    }

    if (status) {
      filter.status = status
    }

    const skip =
      (pageNumber - 1) * limitNumber

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      User.countDocuments(filter),
    ])

    const totalPages = Math.ceil(
      total / limitNumber,
    )

    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get users error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
    })
  }
}

export const createUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      email,
      password,
      role,
      status,
    } = req.body

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message:
          'Name, email and password are required',
      })
      return
    }

    // Do not allow leading or trailing spaces
    if (name !== name.trim()) {
      res.status(400).json({
        success: false,
        message:
          'Name cannot start or end with a space',
      })
      return
    }

    if (email !== email.trim()) {
      res.status(400).json({
        success: false,
        message:
          'Email cannot start or end with a space',
      })
      return
    }

    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    // Name validation
    if (trimmedName.length < 3) {
      res.status(400).json({
        success: false,
        message: 'Name must be at least 3 characters',
      })
      return
    }

    if (!nameRegex.test(trimmedName)) {
      res.status(400).json({
        success: false,
        message:
          'Name can contain only letters and single spaces between words',
      })
      return
    }

    // Email validation
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: 'Please enter a valid email address',
      })
      return
    }

    // Password validation
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message:
          'Password must be at least 6 characters',
      })
      return
    }

    // Role validation
    if (
      role !== undefined &&
      !validRoles.includes(role)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid user role',
      })
      return
    }

    // Status validation
    if (
      status !== undefined &&
      !validStatuses.includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid user status',
      })
      return
    }

    // Duplicate email check
    const existingUser = await User.findOne({
      email: normalizedEmail,
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        message:
          'User with this email already exists',
      })
      return
    }

    const hashedPassword =
      await hashPassword(password)

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Viewer',
      status: status || 'Active',
    })

    // Activity Log
    try {
      await createActivityLog({
        userId: req.user!.userId,
        action: 'create',
        module: 'user',
        description: `Created user ${user.name} (${user.email})`,
      })
    } catch (activityError) {
      console.error(
        'Create user activity log error:',
        activityError,
      )
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinedDate: user.joinedDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Create user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to create user',
    })
  }
}

export const getUserById = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await User.findById(
      req.params.id,
    ).select('-password')

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: user,
    })
  } catch (error) {
    console.error('Get user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
    })
  }
}

export const updateUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      name,
      email,
      role,
      status,
      password,
    } = req.body

    const user = await User.findById(
      req.params.id,
    )

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    // Name validation
    if (name !== undefined) {
      if (name !== name.trim()) {
        res.status(400).json({
          success: false,
          message:
            'Name cannot start or end with a space',
        })
        return
      }

      const trimmedName = name.trim()

      if (trimmedName.length < 3) {
        res.status(400).json({
          success: false,
          message:
            'Name must be at least 3 characters',
        })
        return
      }

      if (!nameRegex.test(trimmedName)) {
        res.status(400).json({
          success: false,
          message:
            'Name can contain only letters and single spaces between words',
        })
        return
      }

      user.name = trimmedName
    }

    // Email validation
    if (email !== undefined) {
      if (email !== email.trim()) {
        res.status(400).json({
          success: false,
          message:
            'Email cannot start or end with a space',
        })
        return
      }

      const normalizedEmail =
        email.trim().toLowerCase()

      if (!emailRegex.test(normalizedEmail)) {
        res.status(400).json({
          success: false,
          message:
            'Please enter a valid email address',
        })
        return
      }

      // Check duplicate email excluding current user
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: user._id },
      })

      if (existingUser) {
        res.status(409).json({
          success: false,
          message:
            'User with this email already exists',
        })
        return
      }

      user.email = normalizedEmail
    }

    // Role validation
    if (role !== undefined) {
      if (!validRoles.includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user role',
        })
        return
      }

      user.role = role
    }

    // Status validation
    if (status !== undefined) {
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid user status',
        })
        return
      }

      user.status = status
    }

    // Password validation
    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message:
            'Password must be at least 6 characters',
        })
        return
      }

      user.password =
        await hashPassword(password)
    }

    await user.save()

    // Activity Log
    try {
      await createActivityLog({
        userId: req.user!.userId,
        action: 'update',
        module: 'user',
        description: `Updated user ${user.name} (${user.email})`,
      })
    } catch (activityError) {
      console.error(
        'Update user activity log error:',
        activityError,
      )
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        joinedDate: user.joinedDate,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    })
  } catch (error) {
    console.error('Update user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to update user',
    })
  }
}

export const deleteUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = await User.findByIdAndDelete(
      req.params.id,
    )

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      })
      return
    }

    // Activity Log
    try {
      await createActivityLog({
        userId: req.user!.userId,
        action: 'delete',
        module: 'user',
        description: `Deleted user ${user.name} (${user.email})`,
      })
    } catch (activityError) {
      console.error(
        'Delete user activity log error:',
        activityError,
      )
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    })
  } catch (error) {
    console.error('Delete user error:', error)

    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
    })
  }
}
