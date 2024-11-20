import React from 'react';
import { Box, Typography, Button, Grid, Paper } from '@mui/material';

const QuizStats = ({ quizStats, onStartQuiz }) => (
  <Paper elevation={3} style={{ padding: '16px', borderRadius: '12px' }}>
    <Grid container spacing={2} justifyContent="center">
      {/* Individual KPI Cards */}
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {quizStats.highest_score.toFixed(1)}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Highest Score
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {quizStats.average_score ? `${(quizStats.average_score).toFixed(1)}%` : "N/A"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Average Score
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {quizStats.times_accessed}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Times Accessed
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {quizStats.times_completed}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Times Completed
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {quizStats.total_questions}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Total Questions
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} sm={4} md={2}>
        <Box
          textAlign="center"
          p={2}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h4" component="div" fontWeight="bold" color="primary">
            {new Date(quizStats.created_on).toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
              })}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Created On
          </Typography>
        </Box>
      </Grid>
    </Grid>

    {/* Start Quiz Button */}
    <Box mt={3} textAlign="center">
      <Button
        variant="contained"
        color="primary"
        onClick={onStartQuiz}
        size="large"
        style={{ fontWeight: 'bold', padding: '10px 30px' }}
      >
        Start Quiz
      </Button>
    </Box>
  </Paper>
);

export default QuizStats;
