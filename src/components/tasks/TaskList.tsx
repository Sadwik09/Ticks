import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TaskWithTags, TaskFilter, SortOption, SortDirection } from '../../types';
import { TaskCard } from './TaskCard';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../context/TaskContext';
import { TagBadge } from './TagBadge';
import { Filter, SortAsc, SortDesc, PlusCircle, Search, X, Tag as TagIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface TaskListProps {
  tasks: TaskWithTags[];
}

export const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const {
    tags,
    filter,
    setFilter,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTasks();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithTags | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateTask = async (taskData: any) => {
    setSubmitting(true);
    await addTask(taskData);
    setSubmitting(false);
    setIsCreating(false);
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;
    
    setSubmitting(true);
    await updateTask(editingTask.id, taskData);
    setSubmitting(false);
    setEditingTask(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ ...filter, search: searchTerm });
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilter({ ...filter, search: '' });
  };

  const clearAllFilters = () => {
    setFilter({
      completed: false,
      priority: 'all',
      tag: null,
      dueDate: 'all',
      search: '',
    });
    setSearchTerm('');
  };

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
    { value: 'created', label: 'Created Date' },
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={16} className="text-gray-400" />}
            fullWidth
            className="pr-10"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X size={16} className="text-gray-400" />
            </button>
          )}
        </form>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="md"
            icon={<Filter size={16} />}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? 'bg-gray-100 dark:bg-gray-800' : ''}
          >
            Filter
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<PlusCircle size={16} />}
            onClick={() => setIsCreating(true)}
          >
            New Task
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters & Sorting</h3>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearAllFilters}
                >
                  Clear All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Status
                  </label>
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => setFilter({ ...filter, completed: false })}
                      className={`
                        flex-1 px-3 py-1.5 text-xs border-t border-b border-l border-gray-300 dark:border-gray-700 rounded-l-md
                        ${!filter.completed ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                      `}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter({ ...filter, completed: true })}
                      className={`
                        flex-1 px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-700 rounded-r-md
                        ${filter.completed ? 'bg-primary-50 border-primary-300 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}
                      `}
                    >
                      Completed
                    </button>
                  </div>
                </div>

                <Select
                  options={dueDateOptions}
                  value={filter.dueDate || 'all'}
                  onChange={(value) => setFilter({ ...filter, dueDate: value as any })}
                  label="Due Date"
                  fullWidth
                />

                <Select
                  options={priorityOptions}
                  value={filter.priority || 'all'}
                  onChange={(value) => setFilter({ ...filter, priority: value as any })}
                  label="Priority"
                  fullWidth
                />

                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-1 p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 min-h-[38px]">
                    {filter.tag ? (
                      <div className="flex items-center">
                        <TagBadge
                          tag={tags.find(t => t.id === filter.tag) || { id: '', name: 'Unknown', color: 'gray', user_id: '', created_at: '' }}
                        />
                        <button
                          type="button"
                          onClick={() => setFilter({ ...filter, tag: null })}
                          className="ml-1 p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.map(tag => (
                            <TagBadge
                              key={tag.id}
                              tag={tag}
                              onClick={() => setFilter({ ...filter, tag: tag.id })}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400 p-1">No tags available</span>
                      )
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort by:</span>
                    <Select
                      options={sortOptions}
                      value={sortOption}
                      onChange={(value) => setSortOption(value as SortOption)}
                      className="w-32"
                    />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {sortDirection === 'asc' ? (
                      <SortAsc size={18} className="text-gray-500 dark:text-gray-400" />
                    ) : (
                      <SortDesc size={18} className="text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tasks.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskCompletion}
                onEdit={setEditingTask}
                onDelete={deleteTask}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="p-4 mb-4 bg-gray-100 dark:bg-gray-700 rounded-full"
          >
            <TagIcon size={32} className="text-gray-500 dark:text-gray-400" />
          </motion.div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
            {filter.search ? 'No tasks match your search criteria' : 'Get started by creating your first task'}
          </p>
          {filter.search ? (
            <Button
              variant="outline"
              onClick={clearAllFilters}
              icon={<X size={16} />}
            >
              Clear filters
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsCreating(true)}
              icon={<PlusCircle size={16} />}
            >
              Create a task
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        title="Create New Task"
      >
        <TaskForm
          availableTags={tags}
          onSubmit={handleCreateTask}
          onCancel={() => setIsCreating(false)}
          isSubmitting={submitting}
        />
      </Modal>

      <Modal
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        title="Edit Task"
      >
        {editingTask && (
          <TaskForm
            initialTask={editingTask}
            availableTags={tags}
            onSubmit={handleUpdateTask}
            onCancel={() => setEditingTask(null)}
            isSubmitting={submitting}
          />
        )}
      </Modal>
    </div>
  );
};