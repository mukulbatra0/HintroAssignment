import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: [true, 'Task must belong to a list'],
      index: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Task must belong to a board'],
      index: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    position: {
      type: Number,
      required: true,
      default: 0,
    },
    labels: [
      {
        color: {
          type: String,
          match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'],
        },
        text: {
          type: String,
          trim: true,
          maxlength: [30, 'Label text cannot exceed 30 characters'],
        },
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
taskSchema.index({ list: 1, position: 1 }); // For ordering tasks in a list
taskSchema.index({ board: 1 }); // For board-wide operations
taskSchema.index({ assignedTo: 1 }); // For finding user's tasks
taskSchema.index({ dueDate: 1 }); // For filtering by due date
taskSchema.index({ isCompleted: 1 }); // For filtering completed tasks

// Text index for search functionality
taskSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to auto-increment position for new tasks
taskSchema.pre('save', async function (next) {
  if (this.isNew && this.position === 0) {
    try {
      // Find the highest position in this list
      const lastTask = await this.constructor
        .findOne({ list: this.list })
        .sort({ position: -1 })
        .select('position');

      this.position = lastTask ? lastTask.position + 1 : 0;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to reorder tasks after deletion
taskSchema.statics.reorderAfterDelete = async function (listId, deletedPosition) {
  await this.updateMany(
    { list: listId, position: { $gt: deletedPosition } },
    { $inc: { position: -1 } }
  );
};

// Static method to move task to different list
taskSchema.statics.moveTask = async function (taskId, newListId, newPosition) {
  const task = await this.findById(taskId);
  if (!task) return null;

  const oldListId = task.list;
  const oldPosition = task.position;

  // If moving to different list
  if (oldListId.toString() !== newListId.toString()) {
    // Reorder old list (close the gap)
    await this.updateMany(
      { list: oldListId, position: { $gt: oldPosition } },
      { $inc: { position: -1 } }
    );

    // Make space in new list
    await this.updateMany(
      { list: newListId, position: { $gte: newPosition } },
      { $inc: { position: 1 } }
    );

    // Update task
    task.list = newListId;
    task.position = newPosition;
  } else {
    // Moving within same list
    if (newPosition > oldPosition) {
      // Moving down
      await this.updateMany(
        {
          list: oldListId,
          position: { $gt: oldPosition, $lte: newPosition },
        },
        { $inc: { position: -1 } }
      );
    } else if (newPosition < oldPosition) {
      // Moving up
      await this.updateMany(
        {
          list: oldListId,
          position: { $gte: newPosition, $lt: oldPosition },
        },
        { $inc: { position: 1 } }
      );
    }
    task.position = newPosition;
  }

  await task.save();
  return task;
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
