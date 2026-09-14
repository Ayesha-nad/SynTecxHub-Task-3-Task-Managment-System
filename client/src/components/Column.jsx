import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { CircleDot, Clock, CheckCircle2, Sparkles } from 'lucide-react';

const Column = ({
  status,
  title,
  tasks = [],
  onEditTask,
  onDeleteTaskRequest,
  onToggleStatus,
  onStatusChange,
  onDropTask,
  isLoading = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  // Status icon mapping
  const getStatusIcon = () => {
    switch (status) {
      case 'todo':
        return <CircleDot size={18} color="#d4a342" />;
      case 'in-progress':
        return <Clock size={18} color="#3b82b6" />;
      case 'done':
        return <CheckCircle2 size={18} color="#2a9d8f" />;
      default:
        return null;
    }
  };

  // Native HTML5 Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only reset if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onDropTask) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      className={`board-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`column-${status}`}
      data-column-status={status}
    >
      {/* Column Header Sheet */}
      <div className="column-header">
        <div className="column-title">
          {getStatusIcon()}
          <span>{title}</span>
        </div>
        <span className="column-counter" title={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>

      {/* Task List / Drop Area */}
      <div className="column-task-list">
        {isLoading ? (
          <>
            <div className="sticky-skeleton">
              <div className="skeleton-line title" />
              <div className="skeleton-line desc" />
              <div className="skeleton-line short" />
            </div>
            <div className="sticky-skeleton" style={{ opacity: 0.6 }}>
              <div className="skeleton-line title" />
              <div className="skeleton-line desc" />
            </div>
          </>
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={onEditTask}
              onDeleteRequest={onDeleteTaskRequest}
              onToggleStatus={onToggleStatus}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          /* Empty State Sticky Doodle */
          <div className="column-empty-doodle">
            <Sparkles size={28} opacity={0.6} />
            <p>
              {status === 'todo'
                ? 'No to-dos pinned yet!'
                : status === 'in-progress'
                ? 'Nothing in progress right now.'
                : 'All done notes land here!'}
            </p>
            <span style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
              Drag notes here or pin a new one
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Column;
