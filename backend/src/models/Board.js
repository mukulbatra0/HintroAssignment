import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board must have an owner'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    backgroundColor: {
      type: String,
      default: '#0284c7', // Default blue
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format'],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
boardSchema.index({ owner: 1, createdAt: -1 });
boardSchema.index({ members: 1 });
boardSchema.index({ isArchived: 1 });

// Compound index for finding user's boards (owner or member)
boardSchema.index({ owner: 1, members: 1 });

// Virtual populate for lists
boardSchema.virtual('lists', {
  ref: 'List',
  localField: '_id',
  foreignField: 'board',
});

// Pre-save middleware to ensure owner is in members array
boardSchema.pre('save', function (next) {
  if (this.isNew && this.owner) {
    // Add owner to members if not already present
    if (!this.members.includes(this.owner)) {
      this.members.push(this.owner);
    }
  }
  next();
});

// Method to check if user has access to board
boardSchema.methods.hasAccess = function (userId) {
  const userIdStr = userId.toString();
  return (
    this.owner.toString() === userIdStr ||
    this.members.some((memberId) => memberId.toString() === userIdStr)
  );
};

// Method to check if user is owner
boardSchema.methods.isOwner = function (userId) {
  return this.owner.toString() === userId.toString();
};

const Board = mongoose.model('Board', boardSchema);

export default Board;
