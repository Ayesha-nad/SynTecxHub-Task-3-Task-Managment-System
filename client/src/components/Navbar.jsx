import React from 'react';
import { Pin, Plus, LogOut, Columns3, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({
  viewMode,
  setViewMode,
  onOpenNewTask,
  stats = {},
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="wood-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="brand-title">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              backgroundColor: '#d9483b',
              borderRadius: '50%',
              boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 2px 3px rgba(255,255,255,0.3)',
              border: '2px solid #a82e23',
              flexShrink: 0,
            }}
          >
            <Pin size={18} color="#fff" style={{ transform: 'rotate(-20deg)' }} />
          </div>
          <span>PinBoard</span>
          <span className="brand-badge">Cork &amp; Notes</span>
        </div>

        {/* View Mode Toggle: Kanban Columns vs Freeform Pinboard */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '20px',
            padding: '2px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '14px',
              color: viewMode === 'kanban' ? '#22303f' : '#f0e6d6',
              backgroundColor: viewMode === 'kanban' ? '#faf7f0' : 'transparent',
              boxShadow: viewMode === 'kanban' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
            }}
            title="Kanban Columns View"
          >
            <Columns3 size={14} />
            <span className="d-none d-sm-inline">Columns</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('freeform')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 9px',
              fontSize: '0.78rem',
              fontWeight: 600,
              borderRadius: '14px',
              color: viewMode === 'freeform' ? '#22303f' : '#f0e6d6',
              backgroundColor: viewMode === 'freeform' ? '#faf7f0' : 'transparent',
              boxShadow: viewMode === 'freeform' ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
              transition: 'all 0.2s ease',
            }}
            title="Freeform Corkboard Pinwall"
          >
            <LayoutGrid size={14} />
            <span className="d-none d-sm-inline">Pinboard</span>
          </button>
        </div>
      </div>

      <div className="header-actions">
        {/* Quick Task Stats Counter (Desktop only) */}
        <div
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '10px',
            color: '#ebdcc4',
            fontSize: '0.82rem',
            fontWeight: 500,
            background: 'rgba(0,0,0,0.25)',
            padding: '4px 10px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          className="d-none d-lg-flex"
        >
          <span title="Total Tasks Pinned">📌 {stats.total || 0} Total</span>
          <span style={{ opacity: 0.4 }}>|</span>
          <span style={{ color: '#a8d8b9' }} title="Tasks Completed">
            ✓ {stats.done || 0} Done
          </span>
          {stats.overdue > 0 && (
            <>
              <span style={{ opacity: 0.4 }}>|</span>
              <span style={{ color: '#f39a8a', fontWeight: 700 }} title="Tasks Overdue">
                ⚠ {stats.overdue} Overdue
              </span>
            </>
          )}
        </div>

        {/* Pin New Task Button */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="btn-sticky-yellow"
          id="btn-pin-new-task"
          style={{ fontSize: '0.84rem', padding: '6px 11px', gap: '5px' }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Pin Task</span>
        </button>

        {/* User Tag Chip */}
        {user && (
          <div className="user-tag" title={`Logged in as ${user.email}`}>
            <div
              className="user-avatar-circle"
              style={{ backgroundColor: user.avatarColor || '#f5e07a' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span>{user.name.split(' ')[0]}</span>
          </div>
        )}

        {/* Logout Button */}
        <button
          type="button"
          onClick={() => logout()}
          className="btn-paper"
          style={{
            padding: '6px 8px',
            color: '#8b1e15',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
          title="Sign Out"
          id="btn-logout"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
