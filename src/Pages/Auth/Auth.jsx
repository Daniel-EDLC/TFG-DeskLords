import { useState } from 'react';
import Login from '../../components/AuthComponents/Login/Login';
import Register from '../../components/AuthComponents/Register/Register';
import { useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';

import './Auth.css';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [googleUserData, setGoogleUserData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Si ya hay usuario autenticado, redirigir
        navigate('/ruta-destino'); 
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSwitchToLogin=async()=>{
    try {
      await signOut(auth); 
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    setGoogleUserData(null);
    setIsLogin(true);
  }

  return (
    <div className="auth-container">
      <div className="auth-menu-tittle">
        <img className='auth-tittle-tittle' src="/public/LOGO.png" alt="" />
      </div>
      <div className="auth-card">
        {isLogin ? (
          <Login
            onSwitch={() => setIsLogin(false)}
            onGoogleRegister={data => {
              setGoogleUserData(data);
              setIsLogin(false);
            }}
          />
        ) : (
          <Register
            onSwitch={handleSwitchToLogin}
            googleData={googleUserData}
          />
        )}
      </div>
  </div>

  );
}
