# schemas/report.py
from pydantic import BaseModel
from typing import List, Dict

class ReportRequest(BaseModel):
    mode: str
    score: float
    missed_words: List[Dict[str, str]]

class ScoreResponse(BaseModel):
    percentage: float
    correct: int
    total: int
