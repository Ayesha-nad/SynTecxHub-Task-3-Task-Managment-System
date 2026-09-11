import express from 'express';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTaskValidationRules,
  updateTaskValidationRules,
  validateRequest,
} from '../middleware/validate.js';

const router = express.Router();

// All task routes require authentication
router.use(protect);

/**
 * Sticky note color palette mapped to priority/status default values
 */
const DEFAULT_COLORS = {
  high: '#f39a8a', // Coral pink
  normal: '#f5e07a', // Warm yellow
  low: '#a9cce8', // Sky blue
  done: '#a8d8b9', // Mint green
};

const PIN_STYLES = ['red-pin', 'brass-pin', 'wood-pin', 'teal-pin', 'washi-tape'];

/**
 * @route   GET /api/tasks/stats/summary
 * @desc    Get aggregate summary counts for user's tasks
 * @access  Private
 */
router.get('/stats/summary', async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: {
            $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] },
          },
          done: {
            $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] },
          },
          highPriority: {
            $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0,
      todo: 0,
      inProgress: 0,
      done: 0,
      highPriority: 0,
      overdue: 0,
    };

    // Extract all unique tags used by this user
    const tagsAggregation = await Task.distinct('tags', { userId });

    res.status(200).json({
      success: true,
      stats: result,
      availableTags: tagsAggregation.filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks belonging to current user with filter, search & sort
 * @access  Private
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, tag, search, sort = 'createdAt', order = 'desc' } = req.query;

    const query = { userId: req.user._id };

    // Status filter (e.g. 'todo', 'in-progress', 'done')
    if (status && ['todo', 'in-progress', 'done'].includes(status)) {
      query.status = status;
    }

    // Priority filter (e.g. 'low', 'normal', 'high')
    if (priority && ['low', 'normal', 'high'].includes(priority)) {
      query.priority = priority;
    }

    // Tag filter
    if (tag && tag.trim() !== '') {
      query.tags = tag.trim();
    }

    // Text search on title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Sorting options
    let sortOptions = {};
    if (sort === 'dueDate') {
      sortOptions = { dueDate: order === 'desc' ? -1 : 1, createdAt: -1 };
    } else if (sort === 'priority') {
      // Custom priority weighting or standard sort
      sortOptions = { priority: order === 'desc' ? -1 : 1, createdAt: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: order === 'desc' ? -1 : 1 };
    } else {
      sortOptions = { createdAt: order === 'desc' ? -1 : 1 };
    }

    const tasks = await Task.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task pinned to the corkboard
 * @access  Private
 */
router.post(
  '/',
  createTaskValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      const {
        title,
        description,
        dueDate,
        priority = 'normal',
        status = 'todo',
        tags = [],
        color,
        pinStyle,
        position,
      } = req.body;

      // Assign natural random rotation between -3.5° and +3.5° for sticky note realism
      const randomRotation = Number(
        (Math.random() * 7 - 3.5).toFixed(1)
      );

      // Choose color based on priority or custom override
      const taskColor = color || DEFAULT_COLORS[priority] || '#f5e07a';

      // Pick a random pin style if not provided
      const taskPin =
        pinStyle ||
        PIN_STYLES[Math.floor(Math.random() * PIN_STYLES.length)];

      const task = await Task.create({
        title,
        description,
        dueDate: dueDate || null,
        priority,
        status,
        tags: Array.isArray(tags)
          ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
          : [],
        color: taskColor,
        pinStyle: taskPin,
        rotation: randomRotation,
        position: position || { x: 0, y: 0 },
        userId: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: 'Task pinned to board successfully!',
        task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task by ID
 * @access  Private
 */
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found on your board.',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task details
 * @access  Private
 */
router.put(
  '/:id',
  updateTaskValidationRules,
  validateRequest,
  async (req, res, next) => {
    try {
      let task = await Task.findOne({
        _id: req.params.id,
        userId: req.user._id,
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found on your board.',
          code: 'TASK_NOT_FOUND',
        });
      }

      const {
        title,
        description,
        dueDate,
        priority,
        status,
        tags,
        color,
        pinStyle,
        position,
      } = req.body;

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (dueDate !== undefined) task.dueDate = dueDate || null;
      if (priority !== undefined) {
        task.priority = priority;
        // Optionally update color if not explicitly custom
        if (!color && task.status !== 'done') {
          task.color = DEFAULT_COLORS[priority] || task.color;
        }
      }
      if (status !== undefined) {
        task.status = status;
        if (status === 'done') {
          task.color = DEFAULT_COLORS.done;
        }
      }
      if (tags !== undefined && Array.isArray(tags)) {
        task.tags = tags
          .map((t) => String(t).trim().toLowerCase())
          .filter(Boolean);
      }
      if (color !== undefined) task.color = color;
      if (pinStyle !== undefined) task.pinStyle = pinStyle;
      if (position !== undefined) task.position = position;

      await task.save();

      res.status(200).json({
        success: true,
        message: 'Task updated successfully!',
        task,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/tasks/:id/status
 * @desc    Quick status update (e.g. for drag-and-drop or completion toggle)
 * @access  Private
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, position } = req.body;

    if (!['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be todo, in-progress, or done.',
      });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found on your board.',
        code: 'TASK_NOT_FOUND',
      });
    }

    task.status = status;
    if (position) {
      task.position = position;
    }

    // Auto-tint completed tasks mint green if not customized
    if (status === 'done') {
      task.color = DEFAULT_COLORS.done;
    } else {
      task.color = DEFAULT_COLORS[task.priority] || '#f5e07a';
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Task moved to ${status}`,
      task,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (pull the pin)
 * @access  Private
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or already removed.',
        code: 'TASK_NOT_FOUND',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Pin pulled! Task removed from your corkboard.',
      deletedTaskId: req.params.id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
