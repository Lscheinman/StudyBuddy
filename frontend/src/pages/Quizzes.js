// frontend/src/pages/Quiz.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QuizCard from '../components/QuizCard';
import NavBar from '../components/NavBar';
import QuestionsProgressChart from '../components/QuestionsProgressChart';
import AnswerAccuracyChart from '../components/AnswerAccuracyChart';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const Quiz = () => {
  const { quizId } = useParams();  // Get quizId from URL
  const [question, setQuestion] = useState('');
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [remainingQuestions, setRemainingQuestions] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);  // Track incorrect answers

  useEffect(() => {
    if (quizId) {
      fetchQuestion(quizId);
    }
  }, [quizId]);

  const fetchQuestion = async (quizId) => {
    try {
      const response = await axios.get(`http://localhost:8000/quizzes/${quizId}/question`);
      setQuestion(response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
    }
  };

  const submitAnswer = async (answer) => {
    try {
      const response = await axios.post(`http://localhost:8000/quizzes/${quizId}/submit-answer`, {
        question: question,
        user_answer: answer,
      });
      
      // Handle response and toast notifications
      if (response.data.result.result === "correct") {
        toast.success("Correct answer!", {
          position: "top-right",
          autoClose: 2000,
        });
        setCorrect(correct + 1);  // Increment correct answers
      } else {
        const correctAnswer = response.data.correct_answer;
        toast.error(`Incorrect answer! The correct answer was: ${correctAnswer}`, {
          position: "top-right",
          autoClose: 3000,
        });
        setWrong(wrong + 1);  // Increment wrong answers
        setIncorrectAnswers([...incorrectAnswers, { question, answer, correctAnswer }]);  // Add to incorrect answers list
      }

      // Update question tracking
      setTotalQuestions(response.data.total_questions);
      setRemainingQuestions(response.data.remaining_questions);

      // Fetch the next question
      fetchQuestion(quizId);
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  return (
    <div>
       <NavBar />
      <ToastContainer />
      <QuizCard question={question} onSubmit={submitAnswer} />

      {/* Expandable Panel */}
      <Accordion style={{ marginTop: '20px' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Quiz Progress and Accuracy</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
            <QuestionsProgressChart answered={correct + wrong} remaining={remainingQuestions} />
            <AnswerAccuracyChart correct={correct} wrong={wrong} />
          </div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Question</TableCell>
                  <TableCell>Your Answer</TableCell>
                  <TableCell>Correct Answer</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {incorrectAnswers.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.question}</TableCell>
                    <TableCell>{entry.answer}</TableCell>
                    <TableCell>{entry.correctAnswer}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default Quiz;
