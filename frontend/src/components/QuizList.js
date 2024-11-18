import React from 'react';
import { FormControl, Select, MenuItem, InputLabel } from '@mui/material';

const QuizList = ({ quizzes, onQuizSelect, selectedQuiz }) => {
  const handleSelect = (event) => {
    const quizId = event.target.value;
    onQuizSelect(quizId);
  };

  return (
    <FormControl fullWidth variant="outlined" style={{ marginBottom: '16px' }}>
      <InputLabel>Select a Quiz</InputLabel>
      <Select
        value={selectedQuiz || ''} // Ensure the value is always controlled
        onChange={handleSelect}
        label="Select a Quiz"
      >
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <MenuItem key={quiz.id} value={quiz.id}>
              {quiz.name}
            </MenuItem>
          ))
        ) : (
          <MenuItem key="no-quizzes" disabled>
            No quizzes available
          </MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default QuizList;
