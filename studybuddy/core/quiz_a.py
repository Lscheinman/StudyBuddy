import random
import pandas as pd
import difflib  # For similarity checking
from collections import Counter
import os
import json
from datetime import datetime
from reports import generate_report_graph

# Initialize global variables
vocabs = {}
correct_attempts = Counter()  # Tracks attempts for practice mode
points = 0  # Player's score
default_csv_path = 'qa.csv'  # Default file path
missed_words = []  # Track missed words for report

# Directory to save results
results_dir = 'results'

def upload_csv(filepath=None):
    """Uploads a CSV file and loads vocabulary into vocabs dictionary."""
    global vocabs
    if not filepath:  # Use default if no file path provided
        filepath = default_csv_path
    
    # Check if the file exists
    if not os.path.exists(filepath):
        print(f"File '{filepath}' not found. Please provide a valid CSV file.")
        return

    # Load the vocabulary CSV
    df = pd.read_csv(filepath)
    if 'DE' in df.columns and 'EN' in df.columns:
        vocabs = dict(zip(df['DE'], df['EN']))
        print(f"Vocabulary uploaded! Total words: {len(vocabs)}")
    else:
        print("CSV format error: Columns 'DE' and 'EN' not found.")

def check_accuracy(user_answer, correct_answer):
    """Checks if the user's answer is within 90% accuracy."""
    similarity = difflib.SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
    return similarity >= 0.9

def save_report(mode, score, missed):
    """Saves the quiz results as a JSON report."""
    if not os.path.exists(results_dir):
        os.makedirs(results_dir)  # Create directory if it doesn't exist
    
    # Timestamp for file name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{results_dir}/{mode}_{timestamp}.json"
    
    # Report content
    report = {
        "mode": mode,
        "timestamp": datetime.now().isoformat(),
        "score": score,
        "missed_words": missed
    }
    
    # Save as JSON file
    with open(filename, 'w') as f:
        json.dump(report, f, indent=4)
    
    print(f"{mode.capitalize()} report saved as '{filename}'.")

def start_quiz(practice_mode=False):
    global points, missed_words
    points = 0  # Reset points for each quiz
    missed_words = []  # Reset missed words
    unanswered = list(vocabs.keys())
    total_questions = 0  # Track the total number of questions asked
    random.shuffle(unanswered)
    
    while unanswered:
        # Select a word, favoring those with lower correct_attempt counts in practice mode
        if practice_mode:
            selected_word = random.choices(unanswered, weights=[1/(1 + correct_attempts[word]) for word in unanswered])[0]
        else:
            selected_word = unanswered.pop()
        
        correct_answer = vocabs[selected_word]
        total_questions += 1  # Increment total questions count

        # Prompt user for answer
        print(f"{selected_word}")
        user_answer = input("Your answer (or type 'ctrl-q' to stop): ").strip()

        # Check for exit shortcut
        if user_answer.lower() == 'ctrl-q':
            confirm_exit = input("Are you sure you want to stop the practice session? (yes/no): ").strip().lower()
            if confirm_exit in ['yes', 'y']:
                print("Exiting practice mode and saving your progress.")
                break
            else:
                continue  # Return to the question if not confirmed

        # Check accuracy and handle close responses
        if user_answer.lower() == correct_answer.lower():
            points += 1
            correct_attempts[selected_word] += 1
            print("Correct!")
        elif check_accuracy(user_answer, correct_answer):
            retry = 'yes'
            while retry in ['yes', 'y']:
                retry = input("Close! Maybe you misspelled it. Try again? (yes/no): ").strip().lower()
                if retry in ['yes', 'y']:
                    user_answer = input("Your answer: ").strip()
                    if user_answer.lower() == correct_answer.lower():
                        points += 1
                        correct_attempts[selected_word] += 1
                        print("Correct!")
                        retry = 'no'  # Exit retry loop on correct answer
                    elif not check_accuracy(user_answer, correct_answer):
                        print(f"Wrong! The correct answer is: {correct_answer}")
                        missed_words.append({selected_word: correct_answer})
                        retry = 'no'  # Exit retry loop on wrong answer
                else:
                    print(f"Wrong! The correct answer is: {correct_answer}")
                    missed_words.append({selected_word: correct_answer})
        else:
            print(f"Wrong! The correct answer is: {correct_answer}")
            missed_words.append({selected_word: correct_answer})

        if practice_mode:
            unanswered.append(selected_word) if correct_attempts[selected_word] == 0 else None

        # Calculate and display the current score as a percentage
        percentage_score = (points / total_questions) * 100
        print(f"Current score: {percentage_score:.2f}% ({points}/{total_questions})")
    
    # Report generation
    mode = "practice" if practice_mode else "quiz"
    save_report(mode, percentage_score, missed_words)
    print(f"{mode.capitalize()} finished! Your final score: {percentage_score:.2f}% ({points}/{total_questions})")

# Start practice mode
def practice_mode():
    """Runs a practice session where incorrect answers appear more often."""
    print("Starting practice mode.")
    start_quiz(practice_mode=True)


if __name__ == "__main__":
    # Prompt for CSV path or use default if left blank
    csv_path = input(f"Enter the path to your CSV file (or press Enter to use '{default_csv_path}'): ").strip()
    upload_csv(csv_path if csv_path else None)
    
    while True:
        print("\nMain Menu:")
        print("1. Start Quiz")
        print("2. Start Practice Mode")
        print("3. Generate Report Graph")
        print("4. Exit")
        
        choice = input("Select an option (1-4): ").strip()
        
        if choice == "1":
            print("Starting quiz...")
            start_quiz()
        elif choice == "2":
            print("Starting practice mode...")
            practice_mode()
        elif choice == "3":
            print("Generating report graph...")
            generate_report_graph(results_dir)
        elif choice == "4":
            print("Exiting program. Goodbye!")
            break
        else:
            print("Invalid choice. Please select a valid option (1-4).")


