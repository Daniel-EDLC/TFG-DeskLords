import { useState } from 'react';
import { auth } from '../../../../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

import './Login.css';

function Login({ onSwitch, onGoogleRegister }) {
  const API_URL = import.meta.env.VITE_API_URL;

  // signOut(auth);

  const provider = new GoogleAuthProvider();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  //Función validar campos
  const validarCampos = () => {
    if (!email || !password) {
      setErrorMsg('Debes completar todos los campos.');
      return false;
    }

    const patronEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!patronEmail.test(email)) {
      setErrorMsg('El correo electrónico no tiene un formato válido.');
      return false;
    }

    return true;
  };

  async function handleLogin() {
    //Limpiamos el mensaje de error
    setErrorMsg('');

    if (!validarCampos()) return;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token = await user.getIdToken();

      const exists = await isCreated(user.uid, token);
      if (exists) {
        //Redirige
        navigate('/menu');
      } else {
        //Avisa de que no existe pero no redirige
        setErrorMsg('Usuario no encontrado');
      }
    } catch (error) {
      console.error('Error en login:', error);

      switch (error.code) {
        case 'auth/wrong-password':
          setErrorMsg('Contraseña incorrecta.');
          break;
        case 'auth/user-not-found':
          setErrorMsg('El correo no está registrado.');
          break;
        case 'auth/invalid-email':
          setErrorMsg('Correo inválido.');
          break;
        default:
          setErrorMsg('Error al iniciar sesión.');
      }
    }
  }

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken()
      const userExists = await isCreated(user.uid, token);

      if (userExists) {
        console.log('usuario encontrado');
        navigate('/menu');
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
      const payload = {
        idPlayer: uid
      }
      const response = await fetch('https://api-meafpnv6bq-ew.a.run.app/api/checkPlayerExists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });      

      return !!response.result;
    } catch (error) {
      console.error('Error:', error);
      return false;
    }
  }

  return (
    <form className="login-form" onSubmit={e => e.preventDefault()}>
      <h2 className="auth-title">Iniciar sesión</h2>

      <label>Email</label>
      <input
        className="auth-input"
        type="text"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Ingresa tu nombre"
      />

      <label>Contraseña</label>
      <input
        className="auth-input"
        type="password"
        value={password}
        onChange={c => setPassword(c.target.value)}
        placeholder="Ingresa tu contraseña"
      />

      {/* Mensaje de error */}
      {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

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
