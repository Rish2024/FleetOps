import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import ExportHub from './pages/ExportHub';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);

  // Restore user session from localStorage on boot
  useEffect(() => {
    const savedUser = localStorage.getItem('fleetops_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fleetops_user');
      }
    }
  }, []);

  // Simple hash-based routing to support browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#/login') {
        setView('login');
        window.scrollTo(0, 0);
      } else if (hash === '#/dashboard' || hash === '#/manager-dashboard') {
        setView('manager-dashboard');
        // Auto-login as manager if no session exists for easy testing
        setUser(prev => prev || { email: 'manager@fleetops.com', role: 'manager' });
        window.scrollTo(0, 0);
      } else if (hash === '#/export-hub') {
        setView('export-hub');
        window.scrollTo(0, 0);
      } else {
        setView('home');
      }
    };

    // Check hash on load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView) => {
    if (newView === 'login') {
      window.location.hash = '#/login';
    } else if (newView === 'manager-dashboard') {
      window.location.hash = '#/dashboard';
    } else if (newView === 'export-hub') {
      window.location.hash = '#/export-hub';
    } else if (newView === 'logout') {
      setUser(null);
      localStorage.removeItem('fleetops_user');
      window.location.hash = '#/';
    } else {
      window.location.hash = '#/';
    }
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('fleetops_user', JSON.stringify(loggedInUser));
    if (loggedInUser.role === 'manager' || loggedInUser.role === 'admin') {
      navigateTo('manager-dashboard');
    } else {
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-blue-100 selection:text-blue-900">
      {view === 'login' ? (
        <Login onNavigate={navigateTo} onLogin={handleLogin} />
      ) : (
        <>
          <Navbar onNavigate={navigateTo} currentView={view} user={user} />
          <main className="flex-grow">
            {view === 'manager-dashboard' ? (
              <ManagerDashboard />
            ) : view === 'export-hub' ? (
              <ExportHub onNavigate={navigateTo} user={user} />
            ) : (
              <Home onNavigate={navigateTo} />
            )}
          </main>
          <Footer onNavigate={navigateTo} />
        </>
      )}
    </div>
  );
}

export default App;

