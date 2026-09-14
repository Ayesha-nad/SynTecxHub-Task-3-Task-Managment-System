import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  Edit3,
  Trash2,
  CheckCircle,
  AlertCircle,
  Pin as PinIcon,
  ChevronRight,
} from 'lucide-react';

/**
 * Render Pushpin SVG Motif
 */
const renderPinMotif = (pinStyle = 'red-pin') => {
  if (pinStyle === 'washi-tape') {
    return <div className="washi-tape-motif" />;
  }

  let headFill = '#d9483b';
  let highlight = '#ff7366';
  let rim = '#a82e23';

  if (pinStyle === 'brass-pin') {
    headFill = '#d4a342';
    highlight = '#fae17a';
    rim = '#9e7523';
  } else if (pinStyle === 'wood-pin') {
    headFill = '#784c2d';
    highlight = '#9c6740';
    rim = '#4e2f18';
  } else if (pinStyle === 'teal-pin') {
    headFill = '#2a9d8f';
    highlight = '#56c6b8';
    rim = '#1b635a';
  }

  return (
    <svg
      className="pin-motif"
      width="24"
      height="28"
      viewBox="0 0 24 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pin Needle */}
      <path d="M12 16 L12 26" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
      {/* Pin Base Shadow / Rim */}
      <circle cx="12" cy="14" r="7" fill={rim} />
      {/* Pin Main Head */}
      <circle cx="12" cy="11" r="7" fill={headFill} />
      {/* Pin 3D Highlight reflection */}
      <ellipse cx="9.5" cy="8.5" rx="2.5" ry="1.8" fill={highlight} opacity="0.9" />
    </svg>
  );
};

const TaskCard = ({
  task,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
  onStatusChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Format due date
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'done';

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year:
          new Date(task.dueDate).getFullYear() !== new Date().getFullYear()
            ? 'numeric'
            : undefined,
      })
    : null;

  // Rotation angle for sticky realism
  const rotation = task.rotation || 0;

  // Handle native HTML5 drag start
  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`sticky-note ${isDragging ? 'is-dragging' : ''}`}
      style={{
        backgroundColor: task.color || '#f5e07a',
        transform: isDragging ? 'scale(1.06) rotate(2deg)' : `rotate(${rotation}deg)`,
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      id={`task-card-${task._id}`}
      data-task-id={task._id}
    >
      {/* Pushpin or Tape Motif at the top */}
      {renderPinMotif(task.pinStyle)}

      {/* Overdue Ribbon Alert */}
      {isOverdue && (
        <div className="overdue-ribbon" title="Task deadline has passed!">
          <AlertCircle size={13} />
          <span>Overdue</span>
        </div>
      )}

      {/* Priority Stamp Badge & Status Toggle Header */}
      <div className="flex-between" style={{ marginBottom: '6px' }}>
        <span className={`priority-stamp priority-${task.priority || 'normal'}`}>
          {task.priority === 'high' ? '🔥 High' : task.priority === 'low' ? '🌱 Low' : '📌 Normal'}
        </span>

        {/* Quick Complete Toggle Button */}
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          className={`note-action-btn ${task.status === 'done' ? 'done-action' : ''}`}
          title={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
          aria-label="Toggle completed state"
        >
          <CheckCircle size={15} />
        </button>
      </div>

      {/* Task Note Title */}
      <h3
        className="note-title"
        style={{
          textDecoration: task.status === 'done' ? 'line-through' : 'none',
          opacity: task.status === 'done' ? 0.75 : 1,
        }}
      >
        {task.title}
      </h3>

      {/* Task Description */}
      {task.description && (
        <p
          className="note-description"
          style={{
            textDecoration: task.status === 'done' ? 'line-through' : 'none',
            opacity: task.status === 'done' ? 0.7 : 1,
          }}
        >
          {task.description}
        </p>
      )}

      {/* Tags Chips */}
      {task.tags && task.tags.length > 0 && (
        <div className="note-tags-list">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="note-tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Note Footer: Due Date & Actions */}
      <div className="note-footer">
        {formattedDueDate ? (
          <div
            className="note-date-badge"
            style={{ color: isOverdue ? '#c93b2b' : 'var(--ink-secondary)', fontWeight: isOverdue ? 700 : 500 }}
          >
            <Calendar size={13} />
            <span>{formattedDueDate}</span>
          </div>
        ) : (
          <div className="note-date-badge" style={{ fontStyle: 'italic', opacity: 0.6 }}>
            No deadline
          </div>
        )}

        {/* Mobile Quick Status Dropdown (Touch Support) */}
        <select
          className="mobile-status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task._id, e.target.value)}
          title="Move note to status"
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        {/* Card Actions: Edit & Delete */}
        <div className="note-actions">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="note-action-btn"
            title="Edit Sticky Note"
            aria-label="Edit task"
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteRequest(task)}
            className="note-action-btn delete-action"
            title="Pull the Pin (Delete Task)"
            aria-label="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
