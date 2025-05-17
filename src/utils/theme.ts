export const toggleDarkMode = () => {
  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  
  if (isCurrentlyDark) {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    document.documentElement.style.setProperty('--toast-bg', '#fff');
    document.documentElement.style.setProperty('--toast-color', '#374151');
    document.documentElement.style.setProperty('--toast-border', '#e5e7eb');
  } else {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    document.documentElement.style.setProperty('--toast-bg', '#1f2937');
    document.documentElement.style.setProperty('--toast-color', '#f3f4f6');
    document.documentElement.style.setProperty('--toast-border', '#374151');
  }
};

export const initializeTheme = () => {
  const userTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  if (userTheme === 'dark' || (!userTheme && systemTheme === 'dark')) {
    document.documentElement.classList.add('dark');
    document.documentElement.style.setProperty('--toast-bg', '#1f2937');
    document.documentElement.style.setProperty('--toast-color', '#f3f4f6');
    document.documentElement.style.setProperty('--toast-border', '#374151');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.style.setProperty('--toast-bg', '#fff');
    document.documentElement.style.setProperty('--toast-color', '#374151');
    document.documentElement.style.setProperty('--toast-border', '#e5e7eb');
  }
};