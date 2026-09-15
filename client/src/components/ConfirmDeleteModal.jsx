import React from 'react';
import { Trash2, PinOff, AlertTriangle } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, taskTitle, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="torn-paper-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="torn-title"
      >
        {/* Decorative mini pin */}
        <div className="torn-pin">
          <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
            <path d="M12 16 L12 26" stroke="#444" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="12" cy="14" r="6" fill="#784c2d" />
            <circle cx="12" cy="11" r="6" fill="#d9483b" />
            <ellipse cx="10" cy="9" rx="2" ry="1.5" fill="#ff7366" />
          </svg>
        </div>

        <h3 id="torn-title" className="torn-paper-title">
          Pull the pin?
        </h3>

        <p className="torn-paper-body">
          Are you sure you want to remove this note from your corkboard? This action cannot be undone.
        </p>

        {taskTitle && (
          <div className="torn-task-preview">
            &ldquo;{taskTitle}&rdquo;
          </div>
        )}

        <div className="torn-paper-actions">
          <button
            type="button"
            className="btn-paper"
            onClick={onClose}
            disabled={isDeleting}
          >
            Keep Pinned
          </button>

          <button
            type="button"
            className="btn-danger-paper"
            onClick={onConfirm}
            disabled={isDeleting}
            id="btn-confirm-delete"
          >
            <PinOff size={16} />
            <span>{isDeleting ? 'Pulling pin...' : 'Pull the Pin'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
