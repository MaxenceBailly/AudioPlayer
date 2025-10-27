import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

function Login() {
  const { theme, toggleTheme } = useTheme();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      alert('Erreur de connexion. Réessayez.');
    }
  };

  return (
    <div className="login-container">
      {/* Bouton thème en haut à droite */}
      <button onClick={toggleTheme} className="btn-theme login-theme-btn">
        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      <div className="login-card">
        <div className="login-header">
          <h1>🎵 Audio Player</h1>
          <p>Connectez-vous pour accéder à vos audios</p>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          className="btn-google"
        >
          <LogIn size={20} />
          Se connecter avec Google
        </button>
        
        <div className="login-footer">
          <p>Développé avec ❤️</p>
        </div>
      </div>
    </div>
  );
}

export default Login;