# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routes import user_routes, quiz_routes

# Initialize database
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI app with custom documentation settings
app = FastAPI(
    title="StudyBuddy API",
    description="API for the StudyBuddy Quiz application, providing endpoints for quiz questions, answers, scoring, and CSV uploads.",
    version="1.0.0",
    docs_url="/docs",      # Swagger UI documentation URL
    redoc_url="/redoc"     # ReDoc documentation URL
)

# CORS settings
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user_routes.router, prefix="/users", tags=["users"])
app.include_router(quiz_routes.router, prefix="/quizzes", tags=["quizzes"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
