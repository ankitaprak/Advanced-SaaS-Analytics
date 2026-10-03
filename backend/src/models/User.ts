import mongoose, { Document, Schema } from 'mongoose'

export type UserRole = 'Admin' | 'Manager' | 'Viewer'
export type UserStatus = 'Active' | 'Inactive'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  role: UserRole
  status: UserStatus
  joinedDate: Date
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Viewer'],
      default: 'Viewer',
    },

    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },

    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model<IUser>('User', userSchema)

export default User