// frontend/src/components/AnswerAccuracyChart.js

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AnswerAccuracyChart = ({ correct, wrong }) => {
  const totalAnswered = correct + wrong;
  const correctPercentage = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

  const data = {
    labels: ['Correct', 'Wrong'],
    datasets: [
      {
        data: [correct, wrong],
        backgroundColor: ['#4caf50', '#f44336'],  // Green for correct, red for wrong
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    cutout: '70%',  // Creates the donut effect
  };

  // Determine center text color based on the dominant value
  const centerTextColor = correct >= wrong ? '#4caf50' : '#f44336';

  return (
    <div style={{ position: 'relative', width: '250px', margin: '0 auto', textAlign: 'center' }}>
      <Doughnut data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -80%)',  // Fine-tune transform for centering
        textAlign: 'center',
        fontSize: '5vw',  // Increase font size
        fontWeight: 'bold',  // Make text bold
        color: centerTextColor,  // Apply the dominant color
      }}>
        {correctPercentage}%
      </div>
    </div>
  );
};

export default AnswerAccuracyChart;
