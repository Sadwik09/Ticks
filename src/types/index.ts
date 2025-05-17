import { Database } from './supabase';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Tag = Database['public']['Tables']['tags']['Row'];
export type TagInsert = Database['public']['Tables']['tags']['Insert'];
export type TagUpdate = Database['public']['Tables']['tags']['Update'];

export type TaskWithTags = Task & { tags: Tag[] };

export type TaskFilter = {
  completed?: boolean;
  priority?: Task['priority'] | 'all';
  tag?: string | null;
  dueDate?: 'today' | 'week' | 'month' | 'all';
  search?: string;
};

export type SortOption = 'dueDate' | 'priority' | 'title' | 'created';
export type SortDirection = 'asc' | 'desc';

export type User = {
  id: string;
  email: string;
};