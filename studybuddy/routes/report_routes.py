from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import User, Quiz, Report
from schemas import ReportRequest, ScoreResponse
from typing import List
from dependencies import get_current_user  # Assumes an auth dependency

router = APIRouter()

@router.post("/start")
def start_quiz(quiz_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the quiz
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Increment times accessed
    quiz.times_accessed += 1

    # Create a new report
    report = Report(
        user_id=current_user.id,
        quiz_id=quiz_id,
        started_on=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    
    return {"report_id": report.id, "started_on": report.started_on}


@router.post("/submit-answer")
def submit_answer(
    report_id: int,
    question: str,
    user_answer: str,
    correct_answer: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Fetch the report
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Process the answer
    if user_answer.strip().lower() == correct_answer.strip().lower():
        report.total_correct += 1
        result = "correct"
    else:
        report.total_incorrect += 1
        report.incorrect_answers.append({
            "question": question,
            "user_answer": user_answer,
            "correct_answer": correct_answer
        })
        result = "incorrect"

    db.commit()

    return {"result": result}


@router.post("/complete")
def complete_quiz(report_id: int, score: float, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch the report
    report = db.query(Report).filter(Report.id == report_id, Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Mark the report as completed
    report.completed_on = datetime.utcnow()
    report.score = score

    # Update quiz stats
    quiz = db.query(Quiz).filter(Quiz.id == report.quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz.times_completed += 1
    quiz.highest_score = max(quiz.highest_score, score)
    quiz.average_score = ((quiz.average_score * (quiz.times_completed - 1)) + score) / quiz.times_completed

    db.commit()

    return {"completed_on": report.completed_on, "score": score}


@router.get("/history", response_model=List[ScoreResponse])
def get_user_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Fetch all reports for the current user
    reports = db.query(Report).filter(Report.user_id == current_user.id).all()

    if not reports:
        return []

    # Transform the data for the response
    history = []
    for report in reports:
        quiz = db.query(Quiz).filter(Quiz.id == report.quiz_id).first()
        history.append({
            "quiz_name": quiz.name,
            "started_on": report.started_on,
            "completed_on": report.completed_on,
            "score": report.score,
            "total_correct": report.total_correct,
            "total_incorrect": report.total_incorrect,
            "incorrect_answers": report.incorrect_answers,
        })

    return history
