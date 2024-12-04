# StudyBuddy API

The **StudyBuddy API** is a FastAPI-based application for managing vocabulary quizzes. It allows users to upload a CSV of questions and answers, start a quiz, submit answers, and track scores. The app is built to be accessible through a frontend and can handle multiple quiz sessions concurrently.

## Features

- **Upload CSV Vocabulary**: Upload a CSV file to initialize a quiz with specific vocabulary.
- **Start and Track Quiz Sessions**: Each quiz session is assigned a unique `quiz_id` to keep questions and answers isolated.
- **Real-time Scoring**: Get scores and feedback after each answer submission.
- **RESTful API**: Endpoints are available for frontend integration.

## Getting Started

The following steps will download the latest version, pre-build the front end, and then run the application.

   ```bash
   git clone https://github.com/your-username/studybuddy.git
   cd StudyBuddy/frontend

   npm install
   npm run build

   cd ..

   docker compose up -d

   ```

### Prerequisites

Ensure you have the following installed:

- **Docker**: [Install Docker](https://docs.docker.com/get-docker/)
- **Python 3.9** (for local testing and development)

### Build and Run with Docker

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/studybuddy.git
   cd studybuddy
   ```
1. **Clone the repository**:
   ```bash
   docker build -t studybuddy .
   ```
1. **Run the Docker container:**:
   ```bash
   docker run -p 8000:8000 studybuddy
   ```
   The application will be accessible at http://localhost:8000.

### Access API Documentation
FastAPI automatically generates interactive documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Summary

- **Dockerfile**: Builds a Docker image of the FastAPI app, exposing it on port 8000.
- **README.md**: Includes instructions for cloning, building, running, and accessing the API, along with deployment guidelines for cloud providers.
  
This setup should give you a fully deployable, containerized FastAPI application, ready for frontend integration and scalable deployment.


studybuddy/
├── routes/
│   ├── __init__.py          # Combines all route modules
│   ├── user_routes.py       # User-related routes
│   ├── quiz_routes.py       # Quiz-related routes
│   ├── report_routes.py     # Report-related routes
├── main.py                  # FastAPI app entry point
├── database.py              # Database connection and Base setup
├── models/
│   ├── __init__.py          # Combines all models
│   ├── user.py              # User model
│   ├── quiz.py              # Quiz model
│   ├── report.py            # Report model
└── ...

