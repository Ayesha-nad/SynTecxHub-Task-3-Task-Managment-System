import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'normal', 'high'],
        message: 'Priority must be either low, normal, or high',
      },
      default: 'normal',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in-progress', 'done'],
        message: 'Status must be either todo, in-progress, or done',
      },
      default: 'todo',
    },
    tags: {
      type: [String],
      default: [],
    },
    color: {
      type: String,
      default: '#f5e07a', // Sticky note yellow by default
    },
    pinStyle: {
      type: String,
      enum: ['red-pin', 'brass-pin', 'wood-pin', 'teal-pin', 'washi-tape'],
      default: 'red-pin',
    },
    rotation: {
      type: Number,
      default: 0, // In degrees (-4 to 4)
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query performance for user task filters and sorting
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, createdAt: -1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
