// frontend/src/pages/Dashboard.js

import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Container, Paper, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(response.data);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    };

    if (token) fetchQuizzes();
  }, [token, logout, navigate]);

  const handleQuizSelect = (event) => {
    const quizId = event.target.value;
    console.log('Selected Quiz ID:', quizId);  // Debugging line
    if (quizId) {
      setSelectedQuiz(quizId);
      navigate(`/quizzes/${quizId}`);
    }
  };

  const handleUpload = async () => {
    if (!file || !name) return setError('Please enter a quiz name and select a CSV file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const response = await axios.post('http://localhost:8000/quizzes/upload-csv', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuizzes([...quizzes, response.data]); // Add new quiz to the list
      setFile(null);
      setName('');
      setError('');
    } catch (error) {
      setError(error.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <>
        <NavBar />
        <Container maxWidth="md" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper elevation={3} style={{ padding: '32px', width: '100%' }}>
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center">
            <Typography variant="h4" component="h1" gutterBottom style={{ fontWeight: 'bold', marginBottom: '24px' }}>
                Your Dashboard
            </Typography>

            <Typography variant="h6" gutterBottom>
                Available Quizzes
            </Typography>

            <FormControl fullWidth variant="outlined" style={{ marginBottom: '24px' }}>
                <InputLabel>Select a Quiz</InputLabel>
                <Select
                value={selectedQuiz}
                onChange={handleQuizSelect}
                label="Select a Quiz"
                >
                {quizzes.length > 0 ? (
                    quizzes.map((quiz) => (
                    <MenuItem key={quiz.id} value={quiz.id}>
                        {quiz.name}
                    </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No quizzes available</MenuItem>
                )}
                </Select>
            </FormControl>

            <Box mt={3} width="100%">
                <Typography variant="h6" gutterBottom>
                Upload New Quiz
                </Typography>
                <TextField
                label="Quiz Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                />
                
                <Box display="flex" justifyContent="center" alignItems="center" gap={2} mb={2}>
                <label htmlFor="file-input">
                    <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])}
                    id="file-input"
                    style={{ display: 'none' }}
                    />
                    <Button
                    variant="contained"
                    color="primary"
                    component="span"
                    startIcon={<UploadFileIcon />}
                    style={{ padding: '10px', fontWeight: 'bold' }}
                    >
                    Choose File
                    </Button>
                </label>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    startIcon={<AddIcon />}
                    style={{ padding: '10px', fontWeight: 'bold' }}
                    disabled={!name || !file}  // Disable until both fields are filled
                >
                    Create Quiz
                </Button>
                </Box>

                {file && (
                <Typography variant="body2" color="textSecondary" style={{ marginBottom: '16px' }}>
                    Selected file: {file.name}
                </Typography>
                )}
                {error && (
                <Typography color="error" variant="body2" style={{ marginTop: '8px' }}>
                    {error}
                </Typography>
                )}
            </Box>
            </Box>
        </Paper>
        </Container>
    </>
  );
};

export default Dashboard;
