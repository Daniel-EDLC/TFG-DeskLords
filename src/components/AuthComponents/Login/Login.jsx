import { useState } from 'react';
import { auth } from '../../../../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import './Login.css';

function Login({ onSwitch, onGoogleRegister }) {
  const API_URL = import.meta.env.VITE_API_URL;

  const provider = new GoogleAuthProvider();
  const [nombre, setNombre] = useState('');
  const [contrasena, setContrasena] = useState('');

  async function handleLogin() {
    try {
      const response = await fetch('url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, contrasena }),
      });

      const data = await response.json();
      if (data.exists) {
        console.log('Usuario encontrado');
      } else {
        console.log('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error en login:', error);
    }
  }

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userExists = await isCreated(user.uid, user.getIdToken());

      if (userExists) {
        console.log('usuario encontrado');
      } else {
        console.log('usuario no encontrado');

        const [firstName, ...lastNames] = user.displayName.split(' ');
        const data = {
          uid: user.uid,
          email: user.email,
          name: firstName,
          surnames: lastNames.join(' '),
        };

        onGoogleRegister(data);
      }
    } catch (error) {
      console.error('Error Google Sign-In:', error);
    }
  }

  async function isCreated(uid, token) {
    try {
      const response = await fetch('url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ uid }),
      });

      return !!response.result;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <form className="login-form" onSubmit={e => e.preventDefault()}>
      <h2 className="auth-title">Iniciar sesión</h2>

      <label>Nombre</label>
      <input
        className="auth-input"
        type="text"
        value={nombre}
        onChange={n => setNombre(n.target.value)}
        placeholder="Ingresa tu nombre"
      />

      <label>Contraseña</label>
      <input
        className="auth-input"
        type="password"
        value={contrasena}
        onChange={c => setContrasena(c.target.value)}
        placeholder="Ingresa tu contraseña"
      />

      <button type="submit" className="auth-button" onClick={handleLogin}>
        Iniciar sesión
      </button>

      <button type="button" className="auth-button google-button" onClick={signInWithGoogle}>
        Iniciar sesión con Google
      </button>

      <div className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button type="button" onClick={onSwitch}>
          Crea una aquí
        </button>
      </div>
    </form>
  );
}

export default Login;
