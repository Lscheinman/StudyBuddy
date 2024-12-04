// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Quizzes from './pages/Quizzes';
import NotFound from './pages/NotFound';

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
    <Toaster />
  </AuthProvider>
);

export default App;

