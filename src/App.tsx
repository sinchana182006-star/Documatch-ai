/**
 * DocuMatch AI - Main Application Router & Entry Point
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardLayout } from './components/DashboardLayout';

type AppView = 'landing' | 'login' | 'register' | 'dashboard';

const MainRouter: React.FC = () => {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');

  // Auto-redirect if user logs in
  useEffect(() => {
    if (user && (currentView === 'login' || currentView === 'register')) {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  const handleLogout = async () => {
    await signOut();
    setCurrentView('landing');
  };

  return (
    <>
      {currentView === 'landing' && (
        <LandingPage
          onNavigate={view => setCurrentView(view)}
        />
      )}

      {currentView === 'login' && (
        <LoginPage
          onNavigate={view => setCurrentView(view)}
        />
      )}

      {currentView === 'register' && (
        <RegisterPage
          onNavigate={view => setCurrentView(view)}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardLayout
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('landing')}
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
