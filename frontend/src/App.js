// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { makeStyles } from '@mui/styles';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import NotFound from './pages/NotFound';

const useStyles = makeStyles((theme) => ({
  toastSuccess: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '4px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
  },
  toastError: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    fontFamily: 'Roboto, sans-serif',
    borderRadius: '4px',
    boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
  },
}));

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/register" element={<Register />} />
        <Route path="/quizzes/:quizId" element={<Quizzes />} /> {/* Route for viewing a specific quiz */}
        <Route path="*" element={<NotFound />} /> {/* Catch-all route for unmatched paths */}
      </Routes>
    </Router>
    <Toaster
        toastOptions={{
          success: {
            style: {
              ...useStyles.toastSuccess,
            },
          },
          error: {
            style: {
              ...useStyles.toastError,
            },
          },
        }}
    />
  </AuthProvider>
);

export default App;

