import React from 'react';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

const Toast = ({ toast, onDismiss }) => {
  const { type = 'info', title, message } = toast;

  const renderIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={20} className="text-emerald-700" />;
      case 'error':
        return <XCircle size={20} className="text-rose-700" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-700" />;
      case 'info':
      default:
        return <Info size={20} className="text-sky-700" />;
    }
  };

  return (
    <div className={`toast-note toast-${type}`} role="alert">
      {/* Decorative mini pin */}
      <div
        style={{
          position: 'absolute',
          top: '-6px',
          left: '12px',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor:
            type === 'success'
              ? '#2a9d8f'
              : type === 'error'
              ? '#d9483b'
              : '#d4a342',
          border: '1px solid rgba(0,0,0,0.25)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />

      <div style={{ marginTop: '2px' }}>{renderIcon()}</div>

      <div className="toast-content">
        {title && <div className="toast-title">{title}</div>}
        <div className="toast-message">{message}</div>
      </div>

      <button
        onClick={onDismiss}
        className="toast-dismiss"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
