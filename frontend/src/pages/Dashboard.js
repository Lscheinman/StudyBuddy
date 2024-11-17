import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import NavBar from '../components/NavBar';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl, 
  Grid, 
  Divider 
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedQuizStats, setSelectedQuizStats] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    };

    const fetchQuizzes = async () => {
      try {
        const response = await axios.get('http://localhost:8000/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(response.data);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        if (error.response && error.response.status === 401) {
          logout();
        }
      }
    };

    if (token) {
      fetchUserData();
      fetchQuizzes();
    }
  }, [token, logout]);

  const handleQuizSelect = async (event) => {
    const quizId = event.target.value;
    setSelectedQuiz(quizId);

    if (quizId) {
      try {
        const response = await axios.get(`http://localhost:8000/reports/by-quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSelectedQuizStats(response.data);
      } catch (error) {
        console.error("Error fetching quiz stats:", error);
        toast.error("Failed to fetch quiz stats.");
      }
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
      const newQuiz = response.data;

      // Display success toast
      toast.success(`Quiz "${name}" uploaded successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });

      // Update quizzes list and reset inputs
      setQuizzes([...quizzes, newQuiz]);
      setFile(null);
      setName('');
      setError('');
    } catch (error) {
      console.error("Error uploading quiz:", error);
      setError(error.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <>
      <NavBar />
      <ToastContainer />
      <Container maxWidth="lg" style={{ minHeight: '100vh', paddingTop: '32px' }}>
        <Paper elevation={3} style={{ padding: '24px' }}>
          <Typography variant="h4" gutterBottom style={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>

          {/* User Profile Section */}
          {userProfile && (
            <Box>
              <Typography variant="h6">Welcome, {userProfile.username}</Typography>
              <Typography variant="body1">Member since: {new Date(userProfile.created_on).toLocaleDateString()}</Typography>
              <Typography variant="body1">Quizzes created: {userProfile.total_quizzes_created}</Typography>
              <Typography variant="body1">Quizzes attempted: {userProfile.total_reports_created}</Typography>
            </Box>
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* Quiz Selection and Stats */}
          <Typography variant="h6" gutterBottom>
            Available Quizzes
          </Typography>
          <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
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

          {selectedQuizStats && (
            <Box>
              <Typography variant="body1">Highest Score: {selectedQuizStats.highest_score}</Typography>
              <Typography variant="body1">Average Score: {selectedQuizStats.average_score}</Typography>
              <Typography variant="body1">Times Accessed: {selectedQuizStats.times_accessed}</Typography>
              <Typography variant="body1">Times Completed: {selectedQuizStats.times_completed}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/quizzes/${selectedQuiz}`)}
                style={{ marginTop: '16px' }}
              >
                Start Quiz
              </Button>
            </Box>
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* Upload New Quiz */}
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
          <Box display="flex" gap={2} mb={2}>
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
              >
                Choose File
              </Button>
            </label>
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              startIcon={<AddIcon />}
              disabled={!name || !file}
            >
              Create Quiz
            </Button>
          </Box>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Paper>
      </Container>
    </>
  );
};

export default Dashboard;
