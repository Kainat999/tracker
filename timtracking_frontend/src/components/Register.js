import React, { useState } from 'react';
import axios from 'axios';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const containerStyle = {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  };

  const formStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#333',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#4caf50',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  };

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
    <div style={containerStyle}>
      <h2>Register</h2>
      <div style={formStyle}>
        <label style={labelStyle} htmlFor="username">Username:</label>
        <input
          style={inputStyle}
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div style={formStyle}>
        <label style={labelStyle} htmlFor="password">Password:</label>
        <input
          style={inputStyle}
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div style={formStyle}>
        <button style={buttonStyle} onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default Register;
