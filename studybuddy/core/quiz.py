# studybuddy/core/quiz.py

import random
import difflib
from collections import Counter

class Quiz:
    def __init__(self):
        self.sessions = {}  # Dictionary to store sessions by quiz_id

    def create_session(self, quiz_id, vocab, name):
        """Create a new session with specific vocabulary and name for the given quiz_id."""
        if quiz_id not in self.sessions:
            self.sessions[quiz_id] = {
                "name": name,                   # Store session-specific name
                "vocabulary": vocab,             # Store session-specific vocabulary
                "questions": list(vocab.keys()), # List of questions for this session
                "correct_attempts": Counter(),
                "points": 0,
                "total_questions": 0,
                "missed_words": []
            }
        return self.sessions[quiz_id]

    def next_question(self, quiz_id):
        session = self.sessions.get(quiz_id)
        if not session or not session["questions"]:
            return None
        random.shuffle(session["questions"])
        return session["questions"].pop()

    def submit_answer(self, quiz_id, question, user_answer):
        session = self.sessions.get(quiz_id)
        if not session:
            return None
        correct_answer = session["vocabulary"].get(question)  # Use session-specific vocabulary
        session["total_questions"] += 1
        if user_answer.lower() == correct_answer.lower():
            session["points"] += 1
            session["correct_attempts"][question] += 1
            return {"result": "correct"}
        elif self.check_accuracy(user_answer, correct_answer):
            return {"result": "close", "correct_answer": correct_answer}
        else:
            session["missed_words"].append({question: correct_answer})
            return {"result": "wrong", "correct_answer": correct_answer}

    def get_score(self, quiz_id):
        session = self.sessions.get(quiz_id)
        if not session:
            return None
        return {
            "percentage": (session["points"] / session["total_questions"]) * 100 if session["total_questions"] else 0,
            "correct": session["points"],
            "total": session["total_questions"]
        }

    def check_accuracy(self, user_answer, correct_answer):
        similarity = difflib.SequenceMatcher(None, user_answer.lower(), correct_answer.lower()).ratio()
        return similarity >= 0.9
