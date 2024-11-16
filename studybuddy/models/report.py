# models.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, JSON
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Link to User
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)  # Link to Quiz
    started_on = Column(DateTime, default=datetime.utcnow)  # When the quiz started
    completed_on = Column(DateTime, nullable=True)  # When the quiz was completed
    score = Column(Float, nullable=True)  # Final score
    total_correct = Column(Integer, default=0)  # Number of correct answers
    total_incorrect = Column(Integer, default=0)  # Number of incorrect answers
    incorrect_answers = Column(JSON, default=[])  # Store incorrect answers as JSON

    # Relationships
    user = relationship("User", back_populates="reports")
    quiz = relationship("Quiz", back_populates="reports")

    def mark_completed(self, score: float):
        """Mark the report as completed with a final score."""
        self.completed_on = datetime.utcnow()
        self.score = score

    def log_answer(self, question: str, user_answer: str, correct_answer: str):
        """Log an answer as correct or incorrect."""
        if user_answer.strip().lower() == correct_answer.strip().lower():
            self.total_correct += 1
            return "correct"
        else:
            self.total_incorrect += 1
            self.incorrect_answers.append({
                "question": question,
                "user_answer": user_answer,
                "correct_answer": correct_answer
            })
            return "incorrect"
        
    @classmethod
    def get_reports_by_user(cls, db_session, user_id: int):
        """Fetch all reports for a given user."""
        return db_session.query(cls).filter(cls.user_id == user_id).all()

    @classmethod
    def get_reports_by_quiz(cls, db_session, quiz_id: int):
        """Fetch all reports for a given quiz."""
        return db_session.query(cls).filter(cls.quiz_id == quiz_id).all()

    @classmethod
    def get_report_by_id(cls, db_session, report_id: int):
        """Fetch a single report by ID."""
        return db_session.query(cls).filter(cls.id == report_id).first()
