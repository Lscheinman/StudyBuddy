# models.py

from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from sqlalchemy.orm import relationship
from database import Base
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)  # Store hashed passwords
    created_on = Column(DateTime, default=datetime.utcnow)

    # Relationships
    quizzes = relationship("Quiz", back_populates="creator", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(username='{self.username}', created_on='{self.created_on}')>"

    def verify_password(self, plain_password: str, hashed_password: str):
        """Verify the provided password against the stored hashed password."""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(plain_password, hashed_password)

    @classmethod
    def create_user(cls, db_session, username: str, hashed_password: str):
        """Create and save a new user."""
        user = cls(username=username, password=hashed_password)
        db_session.add(user)
        db_session.commit()
        return user

    @classmethod
    def get_user_by_username(cls, db_session, username: str):
        """Fetch a user by username."""
        return db_session.query(cls).filter(cls.username == username).first()

    @classmethod
    def get_user_by_id(cls, db_session, user_id: int):
        """Fetch a user by ID."""
        return db_session.query(cls).filter(cls.id == user_id).first()

    @classmethod
    def username_exists(cls, db_session, username: str):
        """Check if a username already exists."""
        return db_session.query(cls).filter(cls.username == username).first() is not None
