import React from 'react';
import TaskCard from './TaskCard';
import { Plus, Pin, Sparkles } from 'lucide-react';

const PinboardFreeform = ({
  tasks = [],
  onEditTask,
  onDeleteTaskRequest,
  onToggleStatus,
  onStatusChange,
  onOpenNewTask,
  isLoading = false,
}) => {
  return (
    <div className="pinboard-canvas">
      {isLoading ? (
        <div className="pinboard-grid">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="pinboard-card-wrapper">
              <div className="sticky-skeleton">
                <div className="skeleton-line title" />
                <div className="skeleton-line desc" />
                <div className="skeleton-line short" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="pinboard-grid">
          {tasks.map((task) => (
            <div key={task._id} className="pinboard-card-wrapper">
              <TaskCard
                task={task}
                onEdit={onEditTask}
                onDeleteRequest={onDeleteTaskRequest}
                onToggleStatus={onToggleStatus}
                onStatusChange={onStatusChange}
              />
            </div>
          ))}

          {/* Direct "Pin New Note" Ghost Card */}
          <div className="pinboard-card-wrapper">
            <button
              type="button"
              onClick={onOpenNewTask}
              style={{
                width: '100%',
                minHeight: '180px',
                border: '2px dashed rgba(255,255,255,0.4)',
                borderRadius: '4px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#fff5e6',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '20px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.16)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Pin a new note here"
            >
              <Plus size={26} />
              <span className="handwritten" style={{ fontSize: '1.35rem' }}>
                + Pin another note
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f8eed9',
            textAlign: 'center',
          }}
        >
          <Sparkles size={36} opacity={0.7} />
          <h3 className="title-hand" style={{ fontSize: '2rem', marginTop: '12px' }}>
            Your corkboard is wide open!
          </h3>
          <p style={{ maxWidth: '360px', opacity: 0.85, marginTop: '6px', fontSize: '0.95rem' }}>
            There are no notes matching your current filters. Pin a fresh sticky note to get started.
          </p>
          <button
            type="button"
            onClick={onOpenNewTask}
            className="btn-sticky-yellow"
            style={{ marginTop: '18px' }}
          >
            <Plus size={18} />
            <span>Pin First Note</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PinboardFreeform;
