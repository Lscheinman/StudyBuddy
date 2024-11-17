import random
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, JSON
from datetime import datetime
from sqlalchemy.orm import relationship, Session
from database import Base
from models.quiz import Quiz
from fastapi import HTTPException


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
    incorrect_answers = Column(JSON, default=list)  # Store incorrect answers as JSON
    asked_questions = Column(JSON, default=list)  # Tracks questions already asked

    # Relationships
    user = relationship("User", back_populates="reports")
    quiz = relationship("Quiz", back_populates="reports")

    @staticmethod
    def create_report(db: Session, user_id: int, quiz_id: int) -> "Report":
        """
        Create a new report for a quiz session.
        """
        # Ensure quiz exists
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        # Increment quiz access count
        quiz.increment_access_count()

        # Create and save report
        report = Report(
            user_id=user_id,
            quiz_id=quiz_id,
            started_on=datetime.utcnow(),
            asked_questions=[],
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report

    def mark_completed(self, db: Session, score: float):
        """
        Mark the report as completed and update quiz statistics.
        """
        self.completed_on = datetime.utcnow()
        self.score = score

        # Update quiz statistics
        quiz = db.query(Quiz).filter(Quiz.id == self.quiz_id).first()
        if quiz:
            quiz.increment_completion_count()
            quiz.update_statistics(score)

        db.commit()

    def log_answer(self, question: str, user_answer: str, correct_answer: str) -> str:
        """
        Log an answer as correct or incorrect.
        """
        if user_answer.strip().lower() == correct_answer.strip().lower():
            self.total_correct += 1
            return "correct"
        else:
            self.total_incorrect += 1
            self.incorrect_answers.append({
                "question": question,
                "user_answer": user_answer,
                "correct_answer": correct_answer,
            })
            return "incorrect"

    @classmethod
    def get_reports_by_user(cls, db: Session, user_id: int) -> list:
        """
        Fetch all reports for a given user.
        """
        return db.query(cls).filter(cls.user_id == user_id).all()

    @classmethod
    def get_reports_by_quiz(cls, db: Session, quiz_id: int) -> list:
        """
        Fetch all reports for a specific quiz.
        """
        return db.query(cls).filter(cls.quiz_id == quiz_id).all()

    @classmethod
    def get_report_by_id(cls, db: Session, report_id: int) -> "Report":
        """
        Fetch a report by its ID.
        """
        return db.query(cls).filter(cls.id == report_id).first()

    def get_next_question(self, db: Session) -> str:
        """
        Fetch the next random question that hasn't been asked yet.
        """
        quiz = db.query(Quiz).filter(Quiz.id == self.quiz_id).first()
        if not quiz:
            raise HTTPException(status_code=404, detail="Quiz not found")

        all_questions = quiz.get_questions()
        remaining_questions = [
            question for question in all_questions.keys()
            if question not in self.asked_questions
        ]

        if not remaining_questions:
            raise HTTPException(status_code=404, detail="No more questions available")

        next_question = random.choice(remaining_questions)
        self.asked_questions.append(next_question)
        db.commit()
        return next_question
