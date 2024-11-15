# routes/quiz_routes.py

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
import pandas as pd
import uuid
from core.quiz import Quiz
from schemas import AnswerRequest, ScoreResponse
from sqlalchemy.orm import Session
from database import get_db

router = APIRouter()
quiz = Quiz()

@router.get("/")
async def get_quizzes():
    """Retrieve all existing quizzes."""
    quizzes = [{"id": quiz_id, "name": session["name"]} for quiz_id, session in quiz.sessions.items()]
    return quizzes

@router.post("/upload-csv")
async def upload_csv(
    file: UploadFile = File(...),
    name: str = Form(...),
):
    """Upload a CSV file to create a new quiz session with a unique name and quiz_id."""
    # Check if the quiz name is already used
    if any(session["name"] == name for session in quiz.sessions.values()):
        raise HTTPException(status_code=400, detail="Quiz name already exists. Please choose another name.")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV.")

    try:
        # Read the CSV file into a DataFrame
        df = pd.read_csv(file.file)

        # Check for required columns "Q" and "A"
        if "Q" not in df.columns or "A" not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain 'Q' and 'A' columns.")

        # Convert the DataFrame into a dictionary for vocabulary
        new_vocabs = dict(zip(df["Q"], df["A"]))

        # Generate a unique quiz_id and create a session with the provided name and vocabulary
        quiz_id = str(uuid.uuid4())
        quiz.create_session(quiz_id, new_vocabs, name)

        return {
            "message": "Vocabulary loaded successfully",
            "words_added": len(new_vocabs),
            "quiz_id": quiz_id,
            "name": name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")

@router.get("/{quiz_id}/question", response_model=str)
async def get_question(quiz_id: str):
    """Fetch the next question for the specified quiz."""
    question = quiz.next_question(quiz_id)
    if question:
        return question
    raise HTTPException(status_code=404, detail="No questions available or invalid quiz ID.")

@router.post("/{quiz_id}/submit-answer")
async def submit_answer(quiz_id: str, answer: AnswerRequest):
    """Submit an answer to a quiz question for the specified quiz."""
    result = quiz.submit_answer(quiz_id, answer.question, answer.user_answer)
    if result:
        session = quiz.sessions[quiz_id]
        current_score = session["points"]
        total_questions = session["total_questions"]
        remaining_questions = len(session["questions"])

        # Include the correct answer if the response indicates an incorrect answer
        correct_answer = result.get("correct_answer") if result["result"] == "wrong" else None

        return {
            "result": result,
            "current_score": current_score,
            "total_questions": total_questions,
            "remaining_questions": remaining_questions,
            "correct_answer": correct_answer,
        }
    else:
        raise HTTPException(status_code=404, detail="Quiz session not found.")

@router.get("/{quiz_id}/score", response_model=ScoreResponse)
async def get_score(quiz_id: str):
    """Retrieve the current score for the specified quiz."""
    score = quiz.get_score(quiz_id)
    if score:
        return score
    else:
        raise HTTPException(status_code=404, detail="Quiz session not found.")
