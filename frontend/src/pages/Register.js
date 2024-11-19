// frontend/src/pages/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container } from '@mui/material';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(process.env.REACT_APP_BACKEND_URL + '/users/register', {
        username,
        password,
      });
      navigate('/'); // Redirect to login page on successful registration
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Registration failed';
      setError(errorMsg);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        mt={8} 
        p={3} 
        borderRadius={2} 
        boxShadow={3}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Register
        </Typography>
        <form onSubmit={handleRegister} style={{ width: '100%', marginTop: '16px' }}>
          <TextField
            label="Username"
            variant="outlined"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" mt={1}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            style={{ marginTop: '16px' }}
          >
            Register
          </Button>
        </form>
        <Button
          variant="text"
          color="secondary"
          onClick={() => navigate('/')}
          style={{ marginTop: '16px' }}
        >
          Already have an account? Login
        </Button>
      </Box>
    </Container>
  );
};

export default Register;
