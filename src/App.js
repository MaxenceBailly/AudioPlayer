import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getUserRole, ROLES, canManageContent } from './config';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import PlayerPanel from './components/PlayerPanel';
import { LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from './contexts/ThemeContext';
import './styles/App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdminView, setShowAdminView] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const role = getUserRole(currentUser.email);
        setShowAdminView(role === ROLES.ADMIN);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowAdminView(false);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh' }}>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const userRole = getUserRole(user.email);
  const isAdmin = canManageContent(user.email);
  
  const getRoleIcon = () => {
    switch(userRole) {
      case ROLES.ADMIN: return '👑';
      case ROLES.PRINCESS: return '👸';
      case ROLES.READER: return '👤';
      default: return '👤';
    }
  };

  const getRoleLabel = () => {
    switch(userRole) {
      case ROLES.ADMIN: return 'Admin';
      case ROLES.PRINCESS: return 'Princesse';
      case ROLES.READER: return 'Lecteur';
      default: return 'Lecteur';
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-info">
          <h1>🎵 Audio Player</h1>
          <p>
            {user.displayName} • {getRoleIcon()} {getRoleLabel()}
          </p>
        </div>
        
        <div className="flex gap-md">
          {/* Bouton changement de thème */}
          <button onClick={toggleTheme} className="btn-theme">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="hide-mobile">
              {theme === 'light' ? 'Sombre' : 'Clair'}
            </span>
          </button>

          {/* Bouton pour l'admin */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminView(!showAdminView)}
              className="btn btn-secondary"
            >
              {showAdminView ? '👁️ Vue Lecteur' : '⚙️ Vue Admin'}
            </button>
          )}
          
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={18} />
            <span className="hide-mobile">Déconnexion</span>
          </button>
        </div>
      </header>

      {showAdminView ? (
        <AdminPanel />
      ) : (
        <PlayerPanel userRole={userRole} />
      )}
    </div>
  );
}

export default App;