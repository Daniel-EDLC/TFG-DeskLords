import React, { useState } from 'react';
import { auth } from '../../../../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';

import './Register.css';


export default function Register({ onSwitch, googleData }) {
  const [email, setEmail] = useState(googleData?.email ||'');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState(googleData?.name ||'');
  const [surnames, setSurnames] = useState(googleData?.surnames ||'');
  const [error, setError] = useState(null);

  const isGoogleUser = Boolean(googleData);

  //Funcion para validar los campos
  const validarCampos = () => {
    // Validar que todos los campos estén rellenos
    if (!username || !name || !surnames || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios');
      return false;
    }

    // Validar que el nombre y apellidos no tengan números
    const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]{2,}$/;
    if (!patronNombre.test(name)) {
      setError('El nombre no debe contener números ni caracteres especiales');
      return false;
    }

    const patronApellidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-.]{2,}$/;
    if (!patronApellidos.test(surnames)) {
      setError('Los apellidos no deben contener números ni caracteres especiales');
      return false;
    }

    // Validar el formato del correo
    const patronEmail = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!patronEmail.test(email)) {
      setError('El correo debe ser una dirección válida de @gmail.com');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (password != confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Si todo está bien devuelve true
    return true;
  }

  //Registrarse normal
  const handleSubmit = async e => {
    e.preventDefault()

    // Validar los campos
    if (!validarCampos()) {
      return
    }

    try {
      let uid = null;
      let token = null;

      if (isGoogleUser) {
        const user = auth.currentUser;
        token = await user.getIdToken();
        uid = googleData.uid;
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        token = await user.getIdToken();
        uid = user.uid;
      }

      await createPlayer(uid, token, name, surnames, username);
    } catch (err) {
      setError(err.message)
    }
  };

  const createPlayer = async (uid, token, name, surnames, username) => {
    try {
      const response = await fetch(`https://api-meafpnv6bq-ew.a.run.app/api/createPlayer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: uid,
          name: name,
          surnames: surnames,
          displayName: username,
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar el usuario en la base de datos');
      }

      const data = await response.json();
      console.log('Usuario guardado en la base de datos:', data);
    } catch (err) {
      console.error('Error al enviar el usuario a la base de datos:', err);
      setError('No se pudo guardar el usuario en la base de datos');
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
  <h2 className="auth-title">Registro</h2>

  <input
    className="auth-input"
    type="text"
    placeholder="Nombre de usuario"
    value={username}
    onChange={e => setUsername(e.target.value)}
  />
  <input
    className="auth-input"
    type="text"
    placeholder="Nombre"
    value={name}
    onChange={e => setName(e.target.value)}
    disabled={isGoogleUser}
  />
  <input
    className="auth-input"
    type="text"
    placeholder="Apellidos"
    value={surnames}
    onChange={e => setSurnames(e.target.value)}
    disabled={isGoogleUser}
  />
  <input
    className="auth-input"
    type="email"
    placeholder="Correo electrónico"
    value={email}
    onChange={e => setEmail(e.target.value)}
    disabled={isGoogleUser}
  />
  <input
    className="auth-input"
    type="password"
    placeholder="Contraseña"
    value={password}
    onChange={e => setPassword(e.target.value)}
  />
  <input
    className="auth-input"
    type="password"
    placeholder="Confirmar contraseña"
    value={confirmPassword}
    onChange={e => setConfirmPassword(e.target.value)}
  />

  {error && <p className="auth-error">{error}</p>}

  <button type="submit" className="auth-button">Registrar</button>

  <div className="auth-switch">
    ¿Ya tienes cuenta?{' '}
    <button type="button" onClick={onSwitch}>
      Inicia sesión aquí
    </button>
  </div>
</form>

  );
}
