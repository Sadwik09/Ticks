import React from 'react';
import { TaskList } from '../components/tasks/TaskList';
import { useTasks } from '../context/TaskContext';

export const TasksPage: React.FC = () => {
  const { filteredTasks, loading, error } = useTasks();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h3 className="text-xl font-medium text-error-600 dark:text-error-400 mb-2">
            Something went wrong
          </h3>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Tasks</h1>
      <TaskList tasks={filteredTasks} />
    </div>
  );
};