import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    <div>
      <h2>Login</h2>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
