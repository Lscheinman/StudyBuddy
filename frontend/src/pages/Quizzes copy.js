import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QuizCard from '../components/QuizCard';
import NavBar from '../components/NavBar';
import QuestionsProgressChart from '../components/QuestionsProgressChart';
import AnswerAccuracyChart from '../components/AnswerAccuracyChart';
import AuthContext from '../context/AuthContext';
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
  const { quizId } = useParams(); // Get quizId from URL
  const { token } = useContext(AuthContext); // Get token from context
  const [question, setQuestion] = useState('');
  const [reportId, setReportId] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [remainingQuestions, setRemainingQuestions] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]); // Track incorrect answers
  const [started, setStarted] = useState(false); 
  const [completed, setCompleted] = useState(false); 

  // Start quiz and fetch the first question
  const startQuiz = useCallback(async () => {
    if (started || completed) return; // Prevent re-execution if already started or completed
    setStarted(true);

    if (!quizId) {
      toast.error("Quiz ID is missing. Please select a quiz to start.");
      return;
    }
    if (!token) {
      toast.error("Authentication token is missing. Please log in again.");
      return;
    }

    try {
      // Start the quiz
      const startResponse = await axios.post(
        `http://localhost:8000/quizzes/start`,
        {},
        {
          params: { quiz_id: quizId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const currentReportId = startResponse.data.report_id;
      setReportId(currentReportId); // Store report ID in state

      toast.success("Quiz started successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error starting quiz:", error);

      if (error.response) {
        toast.error(
          `Failed to start quiz: ${error.response.data.detail || "Unknown error"}`,
          { position: "top-right", autoClose: 5000 }
        );
      } else {
        toast.error("Network error. Please try again.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  }, [quizId, token, started, completed]);

  // Submit an answer
  const submitAnswer = async (answer) => {
    if (completed) return; // Prevent submissions if quiz is completed

    try {
      const response = await axios.post(
        `http://localhost:8000/quizzes/${quizId}/submit-answer`,
        null,
        {
          params: {
            report_id: reportId,
            question: question,
            user_answer: answer,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const {
        status,
        result,
        correct_answer,
        next_question,
        total_correct,
        total_incorrect,
        total_questions,
        message,
        score,
      } = response.data;

      if (status === "completed") {
        // Handle quiz completion
        toast.success(`Quiz completed! Your score: ${score.toFixed(2)}%`, {
          position: "top-right",
          autoClose: 5000,
        });
        setCompleted(true); // Mark quiz as completed
        setRemainingQuestions(0); // No questions left
        return;
      }

      // Update correct/incorrect counts
      if (result === "correct") {
        toast.success("Correct answer!");
        setCorrect(total_correct); // Update correct answers count
      } else {
        toast.error(`Incorrect answer! Correct answer: ${correct_answer}`);
        setWrong(total_incorrect); // Update incorrect answers count
        setIncorrectAnswers((prev) => [
          ...prev,
          { question, answer, correctAnswer: correct_answer },
        ]);
      }

      // Update progress and next question
      setTotalQuestions(total_questions); // Total questions in the quiz
      setRemainingQuestions(total_questions - (total_correct + total_incorrect));
      setQuestion(next_question); // Use the next question from the response
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer.");
    }
  };

  useEffect(() => {
    if (!started && quizId && token) {
      startQuiz(); // Start the quiz
    }
  }, [quizId, token, started, startQuiz]);

  return (
    <div>
      <NavBar />
      <ToastContainer />
      {!completed ? (
        <QuizCard question={question} onSubmit={submitAnswer} />
      ) : (
        <Typography variant="h4" align="center" style={{ marginTop: "20px" }}>
          Quiz Completed! 🎉
        </Typography>
      )}

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
