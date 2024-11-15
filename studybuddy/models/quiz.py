# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
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
    name = Column(String, unique=True, index=True, nullable=False)
    created_on = Column(DateTime, default=datetime.utcnow)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    times_accessed = Column(Integer, default=0)
    times_completed = Column(Integer, default=0)
    highest_score = Column(Float, default=0.0)
    average_score = Column(Float, default=0.0)

    # Relationships
    creator = relationship("User", back_populates="created_quizzes")

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    started_on = Column(DateTime, default=datetime.utcnow)
    completed_on = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    total_correct = Column(Integer, default=0)
    total_incorrect = Column(Integer, default=0)
    incorrect_answers = Column(JSON, default=[])  # Stores a list of incorrect answers

    # Relationships
    user = relationship("User", back_populates="reports")
    quiz = relationship("Quiz", back_populates="reports")