import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import NavBar from '../components/NavBar';
import QuizList from '../components/QuizList';
import QuizStats from '../components/QuizStats'; 
import { Box, Typography, Container, Paper, Divider } from '@mui/material';
import QuizUploadForm from '../components/QuizUploadForm'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [quizzes, setQuizzes] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState('');
  const [selectedQuizStats, setSelectedQuizStats] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('${process.env.REACT_APP_BACKEND_URL}/users/me', {
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
        const response = await axios.get('${process.env.REACT_APP_BACKEND_URL}/quizzes', {
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

  const handleQuizSelect = async (quizId) => {
    setSelectedQuiz(quizId);
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/quizzes/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedQuizStats(response.data);
    } catch (error) {
      console.error("Error fetching quiz stats:", error);
      toast.error("Failed to fetch quiz stats.");
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

          {/* Quiz List and Stats */}
          <QuizList
            key={quizzes.length}
            quizzes={quizzes}
            onQuizSelect={handleQuizSelect}
          />
          {selectedQuiz && selectedQuizStats && (
            <QuizStats
              quizStats={selectedQuizStats}
              onStartQuiz={() => {
                // Navigate to the quiz page
                window.location.href = `/quizzes/${selectedQuiz}`;
              }}
            />
          )}

          <Divider style={{ margin: '24px 0' }} />

          {/* Upload New Quiz */}
          <QuizUploadForm token={token} onQuizUpload={(newQuiz) => setQuizzes([...quizzes, newQuiz])} />
        </Paper>
      </Container>
    </>
  );
};

export default Dashboard;
