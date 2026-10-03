import ActivityLog from '../models/ActivityLog.js'
import type {
  ActivityAction,
  ActivityModule,
} from '../models/ActivityLog.js'

type CreateActivityLogInput = {
  userId: string
  action: ActivityAction
  module: ActivityModule
  description: string
}

export const createActivityLog = async ({
  userId,
  action,
  module,
  description,
}: CreateActivityLogInput) => {
  return ActivityLog.create({
    userId,
    action,
    module,
    description,
  })
}