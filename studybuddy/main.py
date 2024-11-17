# Standard Library Imports
import logging

# Third-Party Library Imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Application Imports
from database import Base, engine
from models import User, Quiz, Report  # Import models to ensure tables are created
from routes import user_routes, quiz_routes, report_routes
from utils.initialize import initialize_database

# Application Initialization
Base.metadata.create_all(bind=engine)  # Initialize database tables

app = FastAPI(
    title="StudyBuddy API",
    description="An API for quizzes and reports.",
    version="1.0.0"
)

initialize_database()  # Initialize the database with sample data

# CORS Middleware
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add Routers
app.include_router(user_routes.router, prefix="/users", tags=["Users"])
app.include_router(quiz_routes.router, prefix="/quizzes", tags=["Quizzes"])
app.include_router(report_routes.router, prefix="/reports", tags=["Reports"])

# Debug or initialization hooks (if any)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
