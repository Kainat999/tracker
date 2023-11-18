import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = () => {
    axios.post('http://localhost:8000/api/register/', { username, password })
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.error('Error during registration:', error);
      });
  };

  return (
    <div>
      <h2>Register</h2>
      <div>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default Register;
