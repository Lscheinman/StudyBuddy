// frontend/src/pages/NotFound.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Container, Paper } from '@mui/material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: '32px', marginTop: '64px', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          404
        </Typography>
        <Typography variant="h6" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Sorry, the page you are looking for does not exist.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
          style={{ marginTop: '16px' }}
        >
          Go to Home
        </Button>
      </Paper>
    </Container>
  );
};

export default NotFound;
