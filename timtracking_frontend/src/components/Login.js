import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css'

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('http://localhost:8000/api/login/', { username, password })
      .then(response => {
        console.log(response.data);

        const token = response.data.token;

        localStorage.setItem('token', token);

        navigate('/dashboard');
      })
      .catch(error => {
        console.error('Error during login:', error);
      });
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <div className="login-form">
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div className="login-form">
        <label htmlFor="password">Password:</label>
        <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="login-form">
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
