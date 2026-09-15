import React, { useState, useEffect } from 'react';
import { X, Pin, Calendar, Tag, AlertCircle, Palette } from 'lucide-react';

const COLOR_PALETTE = [
  { label: 'Warm Yellow', value: '#f5e07a' },
  { label: 'Coral Pink', value: '#f39a8a' },
  { label: 'Mint Green', value: '#a8d8b9' },
  { label: 'Sky Blue', value: '#a9cce8' },
  { label: 'Lavender', value: '#e8d5f5' },
  { label: 'Warm Peach', value: '#ffd39a' },
];

const PIN_OPTIONS = [
  { id: 'red-pin', label: '🔴 Red Pin' },
  { id: 'brass-pin', label: '🟡 Brass Pin' },
  { id: 'teal-pin', label: '🟢 Teal Pin' },
  { id: 'wood-pin', label: '🟤 Wood Pin' },
  { id: 'washi-tape', label: '🏷️ Washi Tape' },
];

const TaskFormModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'normal',
    status: 'todo',
    color: '#f5e07a',
    pinStyle: 'red-pin',
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing an existing task
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        priority: initialData.priority || 'normal',
        status: initialData.status || 'todo',
        color: initialData.color || '#f5e07a',
        pinStyle: initialData.pinStyle || 'red-pin',
        tags: Array.isArray(initialData.tags) ? [...initialData.tags] : [],
      });
    } else {
      // Reset for new task
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'normal',
        status: 'todo',
        color: '#f5e07a',
        pinStyle: 'red-pin',
        tags: [],
      });
    }
    setErrors({});
    setTagInput('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Auto-tint color according to priority if user hasn't explicitly customized
  const handlePriorityChange = (newPriority) => {
    let autoColor = formData.color;
    if (newPriority === 'high') autoColor = '#f39a8a';
    else if (newPriority === 'normal') autoColor = '#f5e07a';
    else if (newPriority === 'low') autoColor = '#a9cce8';

    setFormData((prev) => ({
      ...prev,
      priority: newPriority,
      color: autoColor,
    }));
  };

  // Add tag chip on Enter or comma
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().toLowerCase().replace(/^[#,\s]+/, '');
      if (cleaned && !formData.tags.includes(cleaned)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, cleaned],
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  // Form submission & validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Please write a note title!';
    } else if (formData.title.length > 150) {
      newErrors.title = 'Title cannot exceed 150 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="task-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderTop: `6px solid ${formData.color}`,
        }}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            <Pin size={22} color="#d9483b" />
            <span>{initialData ? 'Edit Sticky Note' : 'Pin New Note'}</span>
          </h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            title="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="notebook-form">
          {/* Title Field */}
          <div className="notebook-field">
            <label className="notebook-label" htmlFor="task-title-input">
              <span>Note Title *</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                {formData.title.length}/150
              </span>
            </label>
            <input
              id="task-title-input"
              type="text"
              className={`notebook-input ${errors.title ? 'has-error' : ''}`}
              placeholder="e.g. Finish client presentation draft..."
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (errors.title) setErrors({ ...errors, title: null });
              }}
              autoFocus
            />
            {errors.title && (
              <div className="field-error-note">
                <AlertCircle size={14} />
                <span>{errors.title}</span>
              </div>
            )}
          </div>

          {/* Description Field */}
          <div className="notebook-field">
            <label className="notebook-label" htmlFor="task-desc-input">
              Description &amp; Checklist (Optional)
            </label>
            <textarea
              id="task-desc-input"
              rows={3}
              className="notebook-input"
              style={{ resize: 'vertical' }}
              placeholder="Add extra context, steps, or important bullet points..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Priority & Status Controls */}
          <div className="modal-two-col-grid">
            <div className="notebook-field">
              <label className="notebook-label" htmlFor="task-priority-select">
                Priority
              </label>
              <select
                id="task-priority-select"
                className="notebook-input"
                value={formData.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                <option value="low">🌱 Low</option>
                <option value="normal">📌 Normal</option>
                <option value="high">🔥 High</option>
              </select>
            </div>

            <div className="notebook-field">
              <label className="notebook-label" htmlFor="task-status-select">
                Column Status
              </label>
              <select
                id="task-status-select"
                className="notebook-input"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date Picker */}
          <div className="notebook-field">
            <label className="notebook-label" htmlFor="task-due-date-input">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} /> Due Date
              </span>
            </label>
            <input
              id="task-due-date-input"
              type="date"
              className="notebook-input"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
          </div>

          {/* Tags Chips Input */}
          <div className="notebook-field">
            <label className="notebook-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={14} /> Tags
              </span>
              <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Press Enter to add tag
              </span>
            </label>
            <div className="tags-input-container">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag-badge-editable">
                  #{tag}
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => removeTag(tag)}
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                className="tag-text-input"
                placeholder={
                  formData.tags.length === 0 ? 'Type tag and press Enter...' : ''
                }
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          {/* Note Color & Pin Motif Customization */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              paddingTop: '6px',
            }}
          >
            <div className="notebook-field">
              <label className="notebook-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Palette size={14} /> Sticky Tint
                </span>
              </label>
              <div className="palette-picker-row">
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`color-swatch-btn ${
                      formData.color === c.value ? 'selected' : ''
                    }`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setFormData({ ...formData, color: c.value })}
                    title={c.label}
                  />
                ))}
              </div>
            </div>

            <div className="notebook-field">
              <label className="notebook-label" htmlFor="task-pin-style-select">
                Pin Motif
              </label>
              <select
                id="task-pin-style-select"
                className="notebook-input"
                value={formData.pinStyle}
                onChange={(e) =>
                  setFormData({ ...formData, pinStyle: e.target.value })
                }
              >
                {PIN_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '12px',
              paddingTop: '16px',
              borderTop: '1px dashed var(--paper-border)',
            }}
          >
            <button
              type="button"
              className="btn-paper"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-wood"
              disabled={isSubmitting}
              id="btn-save-task"
            >
              <Pin size={16} />
              <span>
                {isSubmitting
                  ? 'Pinning...'
                  : initialData
                  ? 'Update Note'
                  : 'Pin to Board'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
