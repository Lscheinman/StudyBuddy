import os
import json
from datetime import datetime
import matplotlib.pyplot as plt

def generate_report_graph(results_dir):
    """Generates a graphical representation of all JSON reports in the results folder."""
    report_files = [f for f in os.listdir(results_dir) if f.endswith('.json')]
    
    if not report_files:
        print("No reports found in the results directory.")
        return
    
    # Initialize lists to store date and score data for each mode
    quiz_dates, quiz_scores = [], []
    practice_dates, practice_scores = [], []

    # Read each JSON report and extract timestamp, score, and mode
    for report_file in report_files:
        with open(os.path.join(results_dir, report_file), 'r') as file:
            report = json.load(file)
            date = datetime.fromisoformat(report['timestamp'])
            score = report['score']
            mode = report['mode']
            
            # Separate data based on mode
            if mode == 'quiz':
                quiz_dates.append(date)
                quiz_scores.append(score)
            elif mode == 'practice':
                practice_dates.append(date)
                practice_scores.append(score)

    # Sort data by date for each mode to ensure correct plotting order
    quiz_data = sorted(zip(quiz_dates, quiz_scores))
    practice_data = sorted(zip(practice_dates, practice_scores))

    if quiz_data:
        quiz_dates, quiz_scores = zip(*quiz_data)
    if practice_data:
        practice_dates, practice_scores = zip(*practice_data)

    # Plot the data with separate lines for quiz and practice
    plt.figure(figsize=(10, 6))
    
    if quiz_data:
        plt.plot(quiz_dates, quiz_scores, marker='o', linestyle='-', label='Quiz', color='blue')
    if practice_data:
        plt.plot(practice_dates, practice_scores, marker='x', linestyle='--', label='Practice', color='green')

    plt.title("Quiz and Practice Scores Over Time")
    plt.xlabel("Date")
    plt.ylabel("Score")
    plt.legend()  # Add a legend to differentiate between quiz and practice
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()