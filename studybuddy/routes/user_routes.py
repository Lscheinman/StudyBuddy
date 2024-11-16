from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database import get_db
from models.user import User
from schemas import RegisterRequest
from utils.utils import create_access_token
from passlib.context import CryptContext

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


@router.post("/token", status_code=status.HTTP_200_OK)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return a JWT token.
    """
    # Fetch user from the database
    user = User.get_user_by_username(db, form_data.username)
    if not user or not user.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Generate JWT token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(user: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new user.
    """
    # Check if the username already exists
    if User.username_exists(db, user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Username already exists"
        )
    
    # Hash the password and create a new user
    hashed_password = pwd_context.hash(user.password)
    new_user = User.create_user(db, user.username, hashed_password)
    
    return {"message": "User registered successfully", "user_id": new_user.id}

@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT token.
    """
    # Fetch the user from the database
    user = User.get_user_by_username(db, form_data.username)
    if not user or not user.verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Create a JWT access token
    access_token = create_access_token(data={"sub": user.username})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/profile/{user_id}", status_code=status.HTTP_200_OK)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch user details by ID.
    """
    user = User.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    
    return {"username": user.username, "created_on": user.created_on}
