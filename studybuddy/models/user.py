# models.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float, JSON
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Store hashed passwords
    created_on = Column(DateTime, default=datetime.utcnow)

    quizzes = relationship("Quiz", back_populates="owner")

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.password)

    @classmethod
    def hash_password(cls, password: str) -> str:
        return pwd_context.hash(password)


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