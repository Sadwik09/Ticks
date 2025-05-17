import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Select, SelectOption } from '../ui/Select';
import { Calendar, Flag, Plus, Tag as TagIcon, X } from 'lucide-react';
import { Task, Tag, TaskInsert, TaskUpdate } from '../../types';
import { TagBadge } from './TagBadge';

interface TaskFormProps {
  initialTask?: Task;
  availableTags: Tag[];
  onSubmit: (task: TaskInsert | TaskUpdate) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const priorityOptions: SelectOption[] = [
  { value: 'low', label: 'Low', icon: <Flag className="text-blue-500" size={16} /> },
  { value: 'medium', label: 'Medium', icon: <Flag className="text-warning-500" size={16} /> },
  { value: 'high', label: 'High', icon: <Flag className="text-error-500" size={16} /> },
];

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  availableTags,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask?.due_date || '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSelectingTag, setIsSelectingTag] = useState(false);

  // Format due date for input if it exists
  useEffect(() => {
    if (initialTask?.due_date) {
      const date = new Date(initialTask.due_date);
      setDueDate(format(date, 'yyyy-MM-dd'));
    }
  }, [initialTask]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    const taskData: TaskInsert | TaskUpdate = {
      title,
      description,
      priority: priority as 'low' | 'medium' | 'high',
      due_date: dueDate || null,
    };
    
    onSubmit(taskData);
  };

  const toggleTagSelection = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const availableTagsForSelection = availableTags.filter(
    tag => !selectedTags.some(t => t.id === tag.id)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        error={errors.title}
        fullWidth
        required
      />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details about this task"
          rows={3}
          className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-gray-400"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={setPriority}
          icon={<Flag size={16} />}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map(tag => (
            <div key={tag.id} className="flex items-center">
              <TagBadge tag={tag} />
              <button
                type="button"
                onClick={() => toggleTagSelection(tag)}
                className="ml-1 p-0.5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          
          {!isSelectingTag && availableTagsForSelection.length > 0 && (
            <Button 
              type="button" 
              variant="outline"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setIsSelectingTag(true)}
            >
              Add tag
            </Button>
          )}
        </div>
        
        {isSelectingTag && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <h4 className="text-sm font-medium mb-2 flex items-center">
              <TagIcon size={16} className="mr-1" />
              Select tags
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableTagsForSelection.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onClick={() => toggleTagSelection(tag)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => setIsSelectingTag(false)}
            >
              Done
            </Button>
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          {initialTask ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};