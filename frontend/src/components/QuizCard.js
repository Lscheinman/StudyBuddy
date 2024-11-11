// frontend/src/components/QuizCard.js

import React from 'react';
import { Card, CardContent, Typography, TextField, Button } from '@mui/material';

const QuizCard = ({ question, onSubmit }) => {
  const [userAnswer, setUserAnswer] = React.useState('');

  const handleAnswerSubmit = () => {
    onSubmit(userAnswer);
    setUserAnswer('');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  // Prevents form submission if this is inside a form
      handleAnswerSubmit();
    }
  };

  return (
    <Card variant="outlined" style={{ margin: '20px', padding: '10px' }}>
      <CardContent>
        <Typography variant="h5" component="div">
          {question}
        </Typography>
        <TextField
          label="Your Answer"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleKeyPress}  // Add the onKeyPress event handler
          fullWidth
          style={{ marginTop: '20px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAnswerSubmit}
          style={{ marginTop: '10px' }}
        >
          Submit Answer
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuizCard;
