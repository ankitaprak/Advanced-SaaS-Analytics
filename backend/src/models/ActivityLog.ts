import mongoose, {
  Document,
  Schema,
  Types,
} from 'mongoose'

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'view'
  | 'export'

export type ActivityModule =
  | 'user'
  | 'transaction'
  | 'notification'
  | 'report'
  | 'analytics'
  | 'dashboard'

export interface IActivityLog extends Document {
  userId: Types.ObjectId
  action: ActivityAction
  module: ActivityModule
  description: string
  createdAt: Date
  updatedAt: Date
}

const activityLogSchema =
  new Schema<IActivityLog>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },

      action: {
        type: String,
        enum: [
          'create',
          'update',
          'delete',
          'login',
          'logout',
          'view',
          'export',
        ],
        required: true,
      },

      module: {
        type: String,
        enum: [
          'user',
          'transaction',
          'notification',
          'report',
          'analytics',
          'dashboard',
        ],
        required: true,
      },

      description: {
        type: String,
        required: true,
        trim: true,
      },
    },
    {
      timestamps: true,
    },
  )

activityLogSchema.index({
  userId: 1,
  createdAt: -1,
})

activityLogSchema.index({
  module: 1,
  createdAt: -1,
})

const ActivityLog =
  mongoose.model<IActivityLog>(
    'ActivityLog',
    activityLogSchema,
  )

export default ActivityLog