import React from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { motion } from 'framer-motion';
import { Tag, TaskWithTags } from '../../types';
import { Pencil, Trash2, Calendar, Flag } from 'lucide-react';
import { TagBadge } from './TagBadge';

interface TaskCardProps {
  task: TaskWithTags;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit: (task: TaskWithTags) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-warning-500',
  high: 'bg-error-500',
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const handleToggleComplete = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggleComplete(task.id, e.target.checked);
  };

  const formatDueDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return 'Today';
    } else if (isTomorrow(date)) {
      return 'Tomorrow';
    } else {
      return format(date, 'MMM d');
    }
  };

  const isDueDatePast = task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-task hover:shadow-task-hover
        transition-all duration-300 border-l-4
        ${task.completed ? 'border-success-500' : 
          task.priority === 'high' ? 'border-error-500' : 
          task.priority === 'medium' ? 'border-warning-500' : 
          'border-primary-500'}
      `}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <label className="flex items-center justify-center w-5 h-5 cursor-pointer">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={handleToggleComplete}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center peer-checked:border-success-500 peer-checked:bg-success-500">
                {task.completed && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </label>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                {task.title}
              </h3>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <button 
                  onClick={() => onEdit(task)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => onDelete(task.id)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            {task.description && (
              <p className={`text-sm ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-600 dark:text-gray-300'} mb-3`}>
                {task.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {task.due_date && (
                <div className={`
                  flex items-center text-xs px-2 py-0.5 rounded
                  ${isDueDatePast ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-300' : 
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                `}>
                  <Calendar size={12} className="mr-1" />
                  {formatDueDate(task.due_date)}
                </div>
              )}
              
              <div className="flex items-center text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                <Flag size={12} className="mr-1" />
                {priorityLabels[task.priority]}
              </div>
              
              {task.tags.map((tag: Tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {task.completed && (
        <div className="h-1 bg-success-100 dark:bg-success-900/20 overflow-hidden rounded-b-lg">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-full bg-success-500"
          />
        </div>
      )}
    </motion.div>
  );
};