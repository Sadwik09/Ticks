import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { AuthPage } from './pages/AuthPage';
import { TasksPage } from './pages/TasksPage';
import { MainLayout } from './components/layout/MainLayout';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const userTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    
    if (userTheme === 'dark' || (!userTheme && systemTheme === 'dark')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  if (loading) return null;

  return (
    <>
      <TaskProvider>
        <MainLayout>
          {user ? <TasksPage /> : <AuthPage />}
        </MainLayout>
      </TaskProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg, #fff)',
            color: 'var(--toast-color, #374151)',
            border: '1px solid var(--toast-border, #e5e7eb)',
          },
        }}
      />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;