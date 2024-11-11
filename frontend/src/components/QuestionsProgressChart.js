// frontend/src/components/QuestionsProgressChart.js

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const QuestionsProgressChart = ({ answered, remaining }) => {
  const totalQuestions = answered + remaining;
  const answeredPercentage = totalQuestions > 0 ? Math.round((answered / totalQuestions) * 100) : 0;

  const data = {
    labels: ['Answered', 'Remaining'],
    datasets: [
      {
        data: [answered, remaining],
        backgroundColor: ['#2196f3', '#ffeb3b'],  // Blue for answered, yellow for remaining
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

  const centerTextColor = answered >= remaining ? '#2196f3' : '#ffeb3b';

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
        {answeredPercentage}%
      </div>
    </div>
  );
};

export default QuestionsProgressChart;
