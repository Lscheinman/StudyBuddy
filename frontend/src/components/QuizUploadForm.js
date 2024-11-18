import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizUploadForm = ({ token, onQuizUpload }) => {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async () => {
    if (!file || !name) return setError('Please enter a quiz name and select a CSV file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);

    try {
      const response = await axios.post('http://localhost:8000/quizzes/upload-csv', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onQuizUpload(response.data);
      setFile(null);
      setName('');
      setError('');
      toast.success(`Quiz "${name}" uploaded successfully!`, {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      setError(error.response?.data?.detail || 'Upload failed');
    }
  };

  return (
    <Box>
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
    </Box>
  );
};

export default QuizUploadForm;
