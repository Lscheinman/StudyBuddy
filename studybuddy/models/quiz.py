# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Quiz(Base):
    __tablename__ = "quizzes"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)  # Quiz name
    created_on = Column(DateTime, default=datetime.utcnow)  # When the quiz was created
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)  # Link to User

    # Statistics
    times_accessed = Column(Integer, default=0)  # Number of times the quiz was started
    times_completed = Column(Integer, default=0)  # Number of times the quiz was completed
    highest_score = Column(Float, default=0.0)  # Highest score achieved on the quiz
    average_score = Column(Float, default=0.0)  # Average score across all attempts

    # Relationships
    creator = relationship("User", back_populates="quizzes")
    reports = relationship("Report", back_populates="quiz", cascade="all, delete-orphan")

    def increment_access_count(self):
        """Increment the times_accessed field."""
        self.times_accessed += 1

    def increment_completion_count(self):
        """Increment the times_completed field."""
        self.times_completed += 1

    def update_statistics(self, new_score: float):
        """Update highest_score and average_score."""
        self.highest_score = max(self.highest_score, new_score)
        if self.times_completed > 0:
            total_score = (self.average_score * (self.times_completed - 1)) + new_score
            self.average_score = total_score / self.times_completed

    @classmethod
    def get_quiz_by_id(cls, db_session, quiz_id: int):
        """Fetch a single quiz by ID."""
        return db_session.query(cls).filter(cls.id == quiz_id).first()

    @classmethod
    def get_all_quizzes(cls, db_session):
        """Fetch all quizzes."""
        return db_session.query(cls).all()

    @classmethod
    def get_quizzes_by_user(cls, db_session, user_id: int):
        """Fetch all quizzes created by a specific user."""
        return db_session.query(cls).filter(cls.created_by == user_id).all()