import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Box, Button, TextField, Typography, Container, Divider } from '@mui/material';
import config from '../config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Create form data as required by OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await axios.post(
        `${config.BACKEND_URL}/users/token`,
        formData,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
      login(response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
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
          Login
        </Typography>
        <form onSubmit={handleLogin} style={{ width: '100%', marginTop: '16px' }}>
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
            Login
          </Button>
        </form>
        <Divider style={{ width: '100%', margin: '24px 0' }} />
        <Typography variant="body1" gutterBottom>
          Don't have an account?
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          onClick={() => navigate('/register')}
        >
          Register
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
