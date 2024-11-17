import random
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
import pandas as pd
from models import User, Quiz, Report
from dependencies import get_current_user

router = APIRouter()

@router.get("/", status_code=status.HTTP_200_OK)
def list_all_quizzes(db: Session = Depends(get_db)):
    """
    List all quizzes.
    """
    quizzes = Quiz.get_all_quizzes(db)
    return [{"id": quiz.id, "name": quiz.name, "created_on": quiz.created_on, "total_questions": quiz.total_questions} for quiz in quizzes]


@router.post("/upload-csv", status_code=status.HTTP_201_CREATED)
async def upload_csv(
    file: UploadFile = File(...),
    name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a CSV file to create a new quiz with a unique name.
    """
    # Check if the quiz name is already in use
    if Quiz.get_quiz_by_name(db, name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quiz name already exists. Please choose another name."
        )
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be a CSV.")

    try:
        # Read the CSV into a DataFrame
        df = pd.read_csv(file.file)

        # Check for required columns "Q" (questions) and "A" (answers)
        if "Q" not in df.columns or "A" not in df.columns:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="CSV must contain 'Q' and 'A' columns.")

        # Convert the DataFrame into a dictionary
        questions = dict(zip(df["Q"], df["A"]))

        # Create a new quiz
        quiz = Quiz(
            name=name,
            questions=questions,
            created_by=current_user.id,  # Assuming the user ID is available in current_user
        )

        quiz.set_questions(questions)  # Serialize questions

        # Add the quiz to the database
        db.add(quiz)
        db.commit()
        db.refresh(quiz)

        return {
            "message": "Quiz created successfully",
            "words_added": len(questions),
            "quiz_id": quiz.id,
            "name": name
        }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error processing file: {str(e)}")


@router.post("/start", status_code=status.HTTP_201_CREATED)
def start_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a new quiz session (create a report).
    """
    # Use centralized report creation logic
    report = Report.create_report(db=db, user_id=current_user.id, quiz_id=quiz_id)
    return {"report_id": report.id, "started_on": report.started_on}


@router.get("/{quiz_id}/question")
def get_next_question(quiz_id: int, report_id: int, db: Session = Depends(get_db)):
    """
    Fetch the next question from the pool of unanswered questions.
    """
    # Get the quiz
    quiz = Quiz.get_quiz_by_id(db, quiz_id)
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Get the report for the current quiz session
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    # Fetch all questions and the already-asked questions
    all_questions = quiz.get_questions()  # Deserialize questions from JSON
    asked_questions = report.asked_questions  # Directly use as list

    # Get remaining questions
    remaining_questions = [q for q in all_questions.keys() if q not in asked_questions]

    if not remaining_questions:
        raise HTTPException(status_code=404, detail="No more questions available")

    # Pick a random question
    next_question = random.choice(remaining_questions)

    # Add to asked questions and update the report
    asked_questions.append(next_question)
    report.asked_questions = asked_questions  # Update in database
    db.commit()

    return {"question": next_question, "total_questions": quiz.total_questions}


@router.post("/{quiz_id}/submit-answer")
def submit_answer(
    quiz_id: int,
    report_id: int,
    question: str,
    user_answer: str,
    db: Session = Depends(get_db),
):
    """
    Submit an answer and fetch the next question.
    """
    report = Report.get_report_by_id(db, report_id)

    # Fetch the quiz to validate
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Validate the question
    all_questions = quiz.get_questions()
    correct_answer = all_questions.get(question)
    if not correct_answer:
        raise HTTPException(status_code=400, detail="Invalid question submitted")

    # Log the answer
    result = report.log_answer(question, user_answer, correct_answer)
    db.commit()

    # Get the next question
    next_question = report.get_next_question(db)

    return {
        "result": result,
        "correct_answer": correct_answer if result == "incorrect" else None,
        "total_correct": report.total_correct,
        "total_incorrect": report.total_incorrect,
        "total_questions": quiz.total_questions,
        "next_question": next_question,
    }


@router.post("/complete", status_code=status.HTTP_200_OK)
def complete_quiz(report_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Mark a quiz session as completed.
    """
    # Fetch the report
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    # Finalize the report
    score = (report.total_correct / (report.total_correct + report.total_incorrect)) * 100 if (report.total_correct + report.total_incorrect) > 0 else 0
    report.completed_on = datetime.utcnow()
    report.score = score

    db.commit()

    return {"completed_on": report.completed_on, "score": score}
