// frontend/src/pages/Quiz.js

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

  console.log(totalQuestions, );

  // Common function to fetch a question
  const fetchQuestion = useCallback(
    async (currentReportId) => {
      try {
        const response = await axios.get(
          `http://localhost:8000/quizzes/${quizId}/question`,
          {
            params: { report_id: currentReportId },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const nextQuestion = response.data.question;
        setQuestion(nextQuestion); // Update state with the fetched question
        setTotalQuestions(response.data.total_questions);

        // Notify the user
        toast.info("Next question is ready!", {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (error) {
        console.error("Error fetching question:", error);

        if (error.response) {
          toast.error(
            `Failed to fetch question: ${error.response.data.detail || "Unknown error"}`,
            { position: "top-right", autoClose: 5000 }
          );
        } else {
          toast.error("Network error. Please try again.", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      }
    },
    [quizId, token]
  );

  // Start quiz and fetch the first question
  const startQuiz = useCallback(async () => {
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

      // Fetch the first question
      await fetchQuestion(currentReportId);
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
  }, [quizId, token, fetchQuestion]);

  // Submit an answer
  const submitAnswer = async (answer) => {
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

      if (response.data.result === "correct") {
        toast.success("Correct answer!");
        setCorrect((prev) => prev + 1);
      } else {
        const correctAnswer = response.data.correct_answer;
        toast.error(`Incorrect answer! Correct answer: ${correctAnswer}`);
        setWrong((prev) => prev + 1);
        setIncorrectAnswers((prev) => [
          ...prev,
          { question, answer, correctAnswer },
        ]);
      }

      setTotalQuestions((prev) => prev + 1);
      setRemainingQuestions(totalQuestions - (correct + wrong + 1));

      // Fetch the next question
      await fetchQuestion(reportId);
    } catch (error) {
      console.error("Error submitting answer:", error);
      toast.error("Failed to submit answer.");
    }
  };

  useEffect(() => {
    if (quizId && token) {
      startQuiz();
    }
  }, [quizId, token, startQuiz]);

  useEffect(() => {
    console.log({
      question,
      reportId,
      correct,
      wrong,
      totalQuestions,
      remainingQuestions,
      incorrectAnswers,
    });
  }, [question, reportId, correct, wrong, totalQuestions, remainingQuestions, incorrectAnswers]);
  

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
