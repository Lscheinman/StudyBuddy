# Dockerfile

# Use an official Python image
FROM python:3.10

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any dependencies specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run the initialization script
RUN python initialize.py

# Expose the application port
EXPOSE 8000

# Run the FastAPI application with uvicorn, enabling hot reload
CMD ["uvicorn", "studybuddy.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
