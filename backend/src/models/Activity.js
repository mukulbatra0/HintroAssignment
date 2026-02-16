import mongoose from 'mongoose';
import { ACTIVITY_TYPES } from '../config/constants.js';

const activitySchema = new mongoose.Schema(
  {
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Activity must belong to a board'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must have a user'],
    },
    action: {
      type: String,
      required: [true, 'Activity must have an action'],
      enum: Object.values(ACTIVITY_TYPES),
    },
    targetType: {
      type: String,
      enum: ['task', 'list', 'board', 'member'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Not required for some actions like member_removed
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Flexible object for action-specific data
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by board and time
activitySchema.index({ board: 1, createdAt: -1 });

// Optional: TTL index to auto-delete old activities after 90 days
// Uncomment if you want automatic cleanup
// activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Static method to create activity
activitySchema.statics.createActivity = async function (
  boardId,
  userId,
  action,
  targetType,
  targetId,
  details = {}
) {
  return await this.create({
    board: boardId,
    user: userId,
    action,
    targetType,
    targetId,
    details,
  });
};

// Method to format activity message
activitySchema.methods.formatMessage = function () {
  const { action, details } = this;
  
  const actionMessages = {
    [ACTIVITY_TYPES.TASK_CREATED]: `created task "${details.taskTitle}"`,
    [ACTIVITY_TYPES.TASK_UPDATED]: `updated task "${details.taskTitle}"`,
    [ACTIVITY_TYPES.TASK_DELETED]: `deleted task "${details.taskTitle}"`,
    [ACTIVITY_TYPES.TASK_MOVED]: `moved task "${details.taskTitle}" from "${details.fromList}" to "${details.toList}"`,
    [ACTIVITY_TYPES.TASK_ASSIGNED]: `assigned "${details.assigneeName}" to task "${details.taskTitle}"`,
    [ACTIVITY_TYPES.TASK_UNASSIGNED]: `unassigned "${details.assigneeName}" from task "${details.taskTitle}"`,
    [ACTIVITY_TYPES.LIST_CREATED]: `created list "${details.listTitle}"`,
    [ACTIVITY_TYPES.LIST_UPDATED]: `updated list "${details.listTitle}"`,
    [ACTIVITY_TYPES.LIST_DELETED]: `deleted list "${details.listTitle}"`,
    [ACTIVITY_TYPES.BOARD_CREATED]: `created this board`,
    [ACTIVITY_TYPES.BOARD_UPDATED]: `updated board details`,
    [ACTIVITY_TYPES.MEMBER_ADDED]: `added "${details.memberName}" to the board`,
    [ACTIVITY_TYPES.MEMBER_REMOVED]: `removed "${details.memberName}" from the board`,
  };

  return actionMessages[action] || 'performed an action';
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;
