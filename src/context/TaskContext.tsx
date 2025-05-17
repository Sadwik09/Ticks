import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskFilter, TaskInsert, TaskUpdate, TaskWithTags, Tag, SortOption, SortDirection } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

type TaskContextType = {
  tasks: TaskWithTags[];
  filteredTasks: TaskWithTags[];
  loading: boolean;
  error: string | null;
  filter: TaskFilter;
  setFilter: (filter: TaskFilter) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  sortDirection: SortDirection;
  setSortDirection: (direction: SortDirection) => void;
  addTask: (task: TaskInsert) => Promise<void>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompletion: (id: string, completed: boolean) => Promise<void>;
  reorderTasks: (tasks: { id: string; position: number }[]) => Promise<void>;
  tags: Tag[];
  addTag: (name: string, color: string) => Promise<void>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  addTagToTask: (taskId: string, tagId: string) => Promise<void>;
  removeTagFromTask: (taskId: string, tagId: string) => Promise<void>;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithTags[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilter>({
    completed: false,
    priority: 'all',
    tag: null,
    dueDate: 'all',
    search: '',
  });
  const [sortOption, setSortOption] = useState<SortOption>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Fetch tasks and tags when the user is authenticated
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setTags([]);
      setLoading(false);
      return;
    }

    const fetchTasksAndTags = async () => {
      setLoading(true);
      try {
        // Fetch tasks
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('*')
          .order('position', { ascending: true })
          .eq('user_id', user.id);

        if (taskError) {
          throw taskError;
        }

        // Fetch tags
        const { data: tagData, error: tagError } = await supabase
          .from('tags')
          .select('*')
          .eq('user_id', user.id);

        if (tagError) {
          throw tagError;
        }

        // Fetch task tags
        const { data: taskTagsData, error: taskTagsError } = await supabase
          .from('task_tags')
          .select('*');

        if (taskTagsError) {
          throw taskTagsError;
        }

        // Combine tasks with their tags
        const tasksWithTags = taskData.map((task) => {
          const taskTags = taskTagsData
            .filter(tt => tt.task_id === task.id)
            .map(tt => tagData.find(tag => tag.id === tt.tag_id))
            .filter((tag): tag is Tag => tag !== undefined);

          return { ...task, tags: taskTags };
        });

        setTasks(tasksWithTags);
        setTags(tagData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load your tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndTags();

    // Subscribe to changes
    const tasksSubscription = supabase
      .channel('tasks-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchTasksAndTags();
      })
      .subscribe();

    const tagsSubscription = supabase
      .channel('tags-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => {
        fetchTasksAndTags();
      })
      .subscribe();

    const taskTagsSubscription = supabase
      .channel('task-tags-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_tags' }, () => {
        fetchTasksAndTags();
      })
      .subscribe();

    return () => {
      tasksSubscription.unsubscribe();
      tagsSubscription.unsubscribe();
      taskTagsSubscription.unsubscribe();
    };
  }, [user]);

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => {
      // Filter by completion status
      if (filter.completed !== undefined && task.completed !== filter.completed) {
        return false;
      }

      // Filter by priority
      if (filter.priority !== 'all' && task.priority !== filter.priority) {
        return false;
      }

      // Filter by tag
      if (filter.tag && !task.tags.some(tag => tag.id === filter.tag)) {
        return false;
      }

      // Filter by due date
      if (filter.dueDate !== 'all' && task.due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.due_date);
        
        if (filter.dueDate === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          if (dueDate < today || dueDate >= tomorrow) {
            return false;
          }
        } else if (filter.dueDate === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          if (dueDate < today || dueDate >= nextWeek) {
            return false;
          }
        } else if (filter.dueDate === 'month') {
          const nextMonth = new Date(today);
          nextMonth.setMonth(nextMonth.getMonth() + 1);
          if (dueDate < today || dueDate >= nextMonth) {
            return false;
          }
        }
      } else if (filter.dueDate !== 'all' && !task.due_date) {
        return false;
      }

      // Filter by search term
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        return (
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.tags.some(tag => tag.name.toLowerCase().includes(searchTerm))
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'dueDate') {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return sortDirection === 'asc' ? 1 : -1;
        if (!b.due_date) return sortDirection === 'asc' ? -1 : 1;
        
        const dateA = new Date(a.due_date);
        const dateB = new Date(b.due_date);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      if (sortOption === 'priority') {
        const priorityOrder = { high: 2, medium: 1, low: 0 };
        const orderA = priorityOrder[a.priority] || 0;
        const orderB = priorityOrder[b.priority] || 0;
        return sortDirection === 'asc' 
          ? orderA - orderB 
          : orderB - orderA;
      }
      
      if (sortOption === 'title') {
        return sortDirection === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      }
      
      if (sortOption === 'created') {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return sortDirection === 'asc' 
          ? dateA.getTime() - dateB.getTime() 
          : dateB.getTime() - dateA.getTime();
      }
      
      return 0;
    });

  // CRUD operations for tasks
  const addTask = async (task: TaskInsert) => {
    if (!user) return;
    
    try {
      const maxPositionQuery = await supabase
        .from('tasks')
        .select('position')
        .order('position', { ascending: false })
        .limit(1)
        .eq('user_id', user.id);

      const maxPosition = maxPositionQuery.data && maxPositionQuery.data.length > 0
        ? maxPositionQuery.data[0].position + 1 
        : 0;

      const { error } = await supabase
        .from('tasks')
        .insert({ ...task, user_id: user.id, position: maxPosition });

      if (error) throw error;
      toast.success('Task added successfully');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
      setError('Failed to add task. Please try again.');
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
      setError('Failed to update task. Please try again.');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
      setError('Failed to delete task. Please try again.');
    }
  };

  const toggleTaskCompletion = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling task completion:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const reorderTasks = async (taskUpdates: { id: string; position: number }[]) => {
    try {
      // We'll use a transaction to update positions
      for (const update of taskUpdates) {
        const { error } = await supabase
          .from('tasks')
          .update({ position: update.position })
          .eq('id', update.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error reordering tasks:', error);
      setError('Failed to reorder tasks. Please try again.');
    }
  };

  // CRUD operations for tags
  const addTag = async (name: string, color: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('tags')
        .insert({ name, color, user_id: user.id });

      if (error) throw error;
      toast.success('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      toast.error('Failed to add tag');
      setError('Failed to add tag. Please try again.');
    }
  };

  const updateTag = async (id: string, name: string, color: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .update({ name, color })
        .eq('id', id);

      if (error) throw error;
      toast.success('Tag updated successfully');
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
      setError('Failed to update tag. Please try again.');
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Tag deleted successfully');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
      setError('Failed to delete tag. Please try again.');
    }
  };

  const addTagToTask = async (taskId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('task_tags')
        .insert({ task_id: taskId, tag_id: tagId });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding tag to task:', error);
      setError('Failed to add tag to task. Please try again.');
    }
  };

  const removeTagFromTask = async (taskId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (error) {
      console.error('Error removing tag from task:', error);
      setError('Failed to remove tag from task. Please try again.');
    }
  };

  const value = {
    tasks,
    filteredTasks,
    loading,
    error,
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
    reorderTasks,
    tags,
    addTag,
    updateTag,
    deleteTag,
    addTagToTask,
    removeTagFromTask,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}