# models.py

from sqlalchemy import Column, Integer, ForeignKey, DateTime, Float, JSON
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Report(Base):
    __tablename__ = "reports"
    __table_args__ = {"extend_existing": True}

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