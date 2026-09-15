import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import Column from '../components/Column';
import PinboardFreeform from '../components/PinboardFreeform';
import TaskFormModal from '../components/TaskFormModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { useToast } from '../context/ToastContext';
import { Sparkles, Plus } from 'lucide-react';

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    highPriority: 0,
    overdue: 0,
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Layout View Mode: 'kanban' | 'freeform'
  const [viewMode, setViewMode] = useState('kanban');

  // Mobile column active tab
  const [mobileActiveTab, setMobileActiveTab] = useState('todo');

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    task: null,
    isDeleting: false,
  });

  const { addToast } = useToast();

  /**
   * Fetch aggregate summary stats
   */
  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get('/tasks/stats/summary');
      if (res.data.success) {
        setStats(res.data.stats || {});
        setAvailableTags(res.data.availableTags || []);
      }
    } catch (err) {
      console.warn('Could not load task stats:', err);
    }
  }, []);

  /**
   * Fetch tasks with active filters and sorting
   */
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (selectedTag) params.tag = selectedTag;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      params.sort = sortBy;
      params.order = sortOrder;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.tasks || []);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error loading tasks',
        message: err.response?.data?.message || 'Could not fetch your tasks.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [priorityFilter, selectedTag, searchQuery, sortBy, sortOrder, addToast]);

  // Load initial tasks and stats
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setSelectedTag('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const isFiltered =
    searchQuery !== '' ||
    priorityFilter !== 'all' ||
    selectedTag !== '' ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  /**
   * Create or update task
   */
  const handleSaveTask = async (taskPayload) => {
    if (editingTask) {
      // Update existing task
      const res = await api.put(`/tasks/${editingTask._id}`, taskPayload);
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask._id ? res.data.task : t))
        );
        addToast({
          type: 'success',
          title: 'Sticky Note Updated',
          message: `"${res.data.task.title}" updated successfully!`,
        });
        fetchStats();
      }
    } else {
      // Create new task
      const res = await api.post('/tasks', taskPayload);
      if (res.data.success) {
        setTasks((prev) => [res.data.task, ...prev]);
        addToast({
          type: 'success',
          title: 'Note Pinned!',
          message: `"${res.data.task.title}" pinned to your board!`,
        });
        fetchStats();
      }
    }
  };

  /**
   * Update task status (for drag-and-drop & mobile dropdown)
   */
  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic local state update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      if (res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.task : t))
        );
        fetchStats();
      }
    } catch (err) {
      // Rollback on failure
      setTasks(previousTasks);
      addToast({
        type: 'error',
        title: 'Could not move note',
        message: err.response?.data?.message || 'Failed to update task status.',
      });
    }
  };

  /**
   * Handle drag-and-drop drop onto a column
   */
  const handleDropTask = (taskId, targetStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== targetStatus) {
      handleStatusChange(taskId, targetStatus);
    }
  };

  /**
   * Quick toggle complete (Done <-> To Do)
   */
  const handleToggleStatus = (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : 'done';
    handleStatusChange(task._id, nextStatus);
  };

  /**
   * Open edit modal
   */
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsFormModalOpen(true);
  };

  /**
   * Open new task modal
   */
  const handleOpenNew = () => {
    setEditingTask(null);
    setIsFormModalOpen(true);
  };

  /**
   * Prompt torn-paper delete confirmation
   */
  const handleDeleteRequest = (task) => {
    setDeleteModalState({
      isOpen: true,
      task,
      isDeleting: false,
    });
  };

  /**
   * Confirm deletion (pull the pin)
   */
  const handleConfirmDelete = async () => {
    const { task } = deleteModalState;
    if (!task) return;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      const res = await api.delete(`/tasks/${task._id}`);
      if (res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== task._id));
        addToast({
          type: 'info',
          title: 'Pin Pulled',
          message: `"${task.title}" has been removed from the board.`,
        });
        fetchStats();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Could not delete note',
        message: err.response?.data?.message || 'Failed to delete task.',
      });
    } finally {
      setDeleteModalState({ isOpen: false, task: null, isDeleting: false });
    }
  };

  // Group tasks by column status
  const todoTasks = useMemo(
    () => tasks.filter((t) => t.status === 'todo'),
    [tasks]
  );
  const inProgressTasks = useMemo(
    () => tasks.filter((t) => t.status === 'in-progress'),
    [tasks]
  );
  const doneTasks = useMemo(
    () => tasks.filter((t) => t.status === 'done'),
    [tasks]
  );

  return (
    <div className="corkboard-container">
      {/* Top Wooden Desk Navbar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenNewTask={handleOpenNew}
        stats={stats}
      />

      {/* Desk Shelf Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        selectedTag={selectedTag}
        setSelectedTag={setSelectedTag}
        availableTags={availableTags}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onResetFilters={handleResetFilters}
        isFiltered={isFiltered}
      />

      {/* Mobile Column Tab Switcher */}
      {viewMode === 'kanban' && (
        <div className="mobile-column-tabs">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'todo' ? 'active' : ''}`}
            onClick={() => setMobileActiveTab('todo')}
          >
            To Do ({todoTasks.length})
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'in-progress' ? 'active' : ''}`}
            onClick={() => setMobileActiveTab('in-progress')}
          >
            In Progress ({inProgressTasks.length})
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileActiveTab === 'done' ? 'active' : ''}`}
            onClick={() => setMobileActiveTab('done')}
          >
            Done ({doneTasks.length})
          </button>
        </div>
      )}

      {/* Main Corkboard Wall Container with Outer Wooden Frame */}
      <main className="corkboard-frame">
        {viewMode === 'kanban' ? (
          <div className="board-canvas">
            {/* Column 1: To Do */}
            <div
              className={`column-wrapper ${
                mobileActiveTab === 'todo' ? 'is-mobile-active' : ''
              }`}
            >
              <Column
                status="todo"
                title="To Do"
                tasks={todoTasks}
                onEditTask={handleOpenEdit}
                onDeleteTaskRequest={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                isLoading={isLoading}
              />
            </div>

            {/* Column 2: In Progress */}
            <div
              className={`column-wrapper ${
                mobileActiveTab === 'in-progress' ? 'is-mobile-active' : ''
              }`}
            >
              <Column
                status="in-progress"
                title="In Progress"
                tasks={inProgressTasks}
                onEditTask={handleOpenEdit}
                onDeleteTaskRequest={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                isLoading={isLoading}
              />
            </div>

            {/* Column 3: Done */}
            <div
              className={`column-wrapper ${
                mobileActiveTab === 'done' ? 'is-mobile-active' : ''
              }`}
            >
              <Column
                status="done"
                title="Done"
                tasks={doneTasks}
                onEditTask={handleOpenEdit}
                onDeleteTaskRequest={handleDeleteRequest}
                onToggleStatus={handleToggleStatus}
                onStatusChange={handleStatusChange}
                onDropTask={handleDropTask}
                isLoading={isLoading}
              />
            </div>
          </div>
        ) : (
          /* Freeform Pinboard Scatter View */
          <PinboardFreeform
            tasks={tasks}
            onEditTask={handleOpenEdit}
            onDeleteTaskRequest={handleDeleteRequest}
            onToggleStatus={handleToggleStatus}
            onStatusChange={handleStatusChange}
            onOpenNewTask={handleOpenNew}
            isLoading={isLoading}
          />
        )}
      </main>

      {/* Bottom Board Ribbon Stats Shelf */}
      <footer className="board-stats-shelf">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="stat-item">
            <span className="stat-dot todo" />
            <span>To Do: <strong>{stats.todo || 0}</strong></span>
          </div>
          <div className="stat-item">
            <span className="stat-dot in-progress" />
            <span>In Progress: <strong>{stats.inProgress || 0}</strong></span>
          </div>
          <div className="stat-item">
            <span className="stat-dot done" />
            <span>Completed: <strong>{stats.done || 0}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', opacity: 0.85 }}>
          <span className="handwritten" style={{ fontSize: '1.05rem' }}>
            📌 Drag notes between columns or toggle completion with the check pin
          </span>
        </div>
      </footer>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />

      {/* Torn-Paper Delete Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        onClose={() =>
          setDeleteModalState({ isOpen: false, task: null, isDeleting: false })
        }
        onConfirm={handleConfirmDelete}
        taskTitle={deleteModalState.task?.title}
        isDeleting={deleteModalState.isDeleting}
      />
    </div>
  );
};

export default Board;
