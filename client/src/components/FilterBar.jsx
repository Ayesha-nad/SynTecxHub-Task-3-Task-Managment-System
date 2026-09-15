import React from 'react';
import { Search, X, Filter, Tag, ArrowDownUp, RotateCcw } from 'lucide-react';

const FilterBar = ({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  selectedTag,
  setSelectedTag,
  availableTags = [],
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onResetFilters,
  isFiltered,
}) => {
  return (
    <div className="desk-shelf">
      <div className="filter-group-left">
        {/* Search Paper Box */}
        <div className="search-paper-box">
          <Search size={16} className="search-icon-pos" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="task-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Priority Filter Pills */}
        <div className="filter-pills">
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--ink-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Filter size={14} /> Priority:
          </span>

          <button
            type="button"
            className={`filter-pill-btn ${priorityFilter === 'all' ? 'active' : ''}`}
            onClick={() => setPriorityFilter('all')}
          >
            All
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${
              priorityFilter === 'high' ? 'active pill-high' : ''
            }`}
            onClick={() => setPriorityFilter('high')}
          >
            🔥 High
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${
              priorityFilter === 'normal' ? 'active pill-normal' : ''
            }`}
            onClick={() => setPriorityFilter('normal')}
          >
            📌 Normal
          </button>
          <button
            type="button"
            className={`filter-pill-btn ${
              priorityFilter === 'low' ? 'active pill-low' : ''
            }`}
            onClick={() => setPriorityFilter('low')}
          >
            🌱 Low
          </button>
        </div>

        {/* Tag Filters (if available) */}
        {availableTags.length > 0 && (
          <div className="filter-pills">
            <span
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                color: 'var(--ink-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Tag size={13} /> Tag:
            </span>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{
                padding: '4px 10px',
                fontSize: '0.82rem',
                borderRadius: '16px',
                backgroundColor: selectedTag ? '#faf7f0' : '#ffffff',
                borderColor: selectedTag ? '#784c2d' : 'var(--paper-border)',
                fontWeight: selectedTag ? 600 : 400,
              }}
              id="tag-filter-select"
            >
              <option value="">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls: Sorting & Reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowDownUp size={14} style={{ color: 'var(--ink-secondary)' }} />
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            style={{
              padding: '5px 10px',
              fontSize: '0.82rem',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--paper-border)',
            }}
            id="task-sort-select"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="dueDate-asc">Due Date (Earliest)</option>
            <option value="priority-desc">Priority</option>
            <option value="title-asc">Title (A-Z)</option>
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="btn-paper"
            style={{ padding: '5px 10px', fontSize: '0.82rem' }}
            title="Reset active filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
