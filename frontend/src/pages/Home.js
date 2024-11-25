// frontend/src/pages/Home.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Container,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Box,
  TextField,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import config from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [quizName, setQuizName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all existing quizzes on component mount
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`${config.BACKEND_URL}/quizzes`);
        setQuizzes(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setIsLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartExistingQuiz = () => {
    navigate(`/quizzes/${selectedQuiz}`);
  };

  const handleCreateNewQuiz = async () => {
    if (!csvFile || !quizName) {
      alert('Please enter a quiz name and upload a CSV file named qa.csv with Q and A columns.');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);
    formData.append('name', quizName);  // Add quiz name to formData

    try {
      const response = await axios.post(config.BACKEND_URL + '/upload-csv', formData);
      const newQuizId = response.data.quiz_id;
      navigate(`/quizzes/${newQuizId}`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError(error.response.data.detail);  // Display error message if quiz name already exists
      } else {
        console.error('Error creating new quiz:', error);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.name === 'qa.csv') {
      setCsvFile(file);
      setError(null); // Clear any previous error related to file name
    } else {
      setCsvFile(null);
      setError('Please select a file named qa.csv.');
    }
  };

  const isButtonDisabled = !quizName || !csvFile;

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h3" gutterBottom>
        StudyBuddy Quiz
      </Typography>

      {quizzes.length > 0 && (
        <>
          <FormControl fullWidth style={{ marginBottom: '20px' }}>
            <InputLabel>Select an existing quiz</InputLabel>
            <Select
              value={selectedQuiz}
              onChange={(e) => setSelectedQuiz(e.target.value)}
              label="Select an existing quiz"
            >
              {quizzes.map((quiz) => (
                <MenuItem key={quiz.id} value={quiz.id}>
                  {quiz.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={handleStartExistingQuiz}
            style={{ margin: '10px' }}
            disabled={!selectedQuiz}
          >
            Start Selected Quiz
          </Button>
        </>
      )}

      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setIsCreatingNew(!isCreatingNew)}
        style={{ margin: '10px' }}
      >
        Create New Quiz
      </Button>

      {isCreatingNew && (
        <Box mt={2}>
          <TextField
            label="Quiz Name"
            variant="outlined"
            fullWidth
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <Typography variant="body1" gutterBottom>
            Upload a CSV file named <strong>qa.csv</strong> with "Q" and "A" columns to create a new quiz.
          </Typography>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewQuiz}
            style={{ marginTop: '10px' }}
            disabled={isButtonDisabled}  // Disable button until both conditions are met
          >
            Upload and Start New Quiz
          </Button>
          {error && (
            <Typography color="error" style={{ marginTop: '10px' }}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
};

export default Home;
