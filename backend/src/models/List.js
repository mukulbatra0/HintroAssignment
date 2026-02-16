import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'List title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'List must belong to a board'],
    },

    position: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for board + position (for ordering lists)
listSchema.index({ board: 1, position: 1 });

// Virtual populate for tasks
listSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'list',
});

// Pre-save middleware to auto-increment position for new lists
listSchema.pre('save', async function (next) {
  if (this.isNew && this.position === 0) {
    try {
      // Find the highest position in this board
      const lastList = await this.constructor
        .findOne({ board: this.board })
        .sort({ position: -1 })
        .select('position');

      this.position = lastList ? lastList.position + 1 : 0;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Static method to reorder lists after deletion
listSchema.statics.reorderAfterDelete = async function (boardId, deletedPosition) {
  await this.updateMany(
    { board: boardId, position: { $gt: deletedPosition } },
    { $inc: { position: -1 } }
  );
};

const List = mongoose.model('List', listSchema);

export default List;
