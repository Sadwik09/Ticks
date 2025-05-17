import React from 'react';
import { Tag } from '../../types';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onClick }) => {
  const colorClass = colorMap[tag.color] || colorMap.gray;
  
  return (
    <span 
      className={`
        inline-flex items-center text-xs px-2 py-0.5 rounded
        ${colorClass}
        ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
      `}
      onClick={onClick}
    >
      {tag.name}
    </span>
  );
};