import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User
from utils.utils import hash_password

# Load environment variables
load_dotenv()

def create_admin_user(db: Session):
    """
    Create a default admin user if it doesn't exist.
    """
    admin_username = "admin"
    admin_password = os.getenv("ADMIN_PASSWORD")

    if not admin_password:
        raise RuntimeError("ADMIN_PASSWORD is not set in the .env file")

    # Check if admin already exists
    admin_user = db.query(User).filter(User.username == admin_username).first()
    if admin_user:
        print("Admin user already exists.")
        return

    # Create the admin user
    new_admin = User(
        username=admin_username,
        password=hash_password(admin_password),
        is_admin=True,
    )
    db.add(new_admin)
    db.commit()
    print("Admin user created successfully.")

def initialize_database():
    """
    Run all initialization tasks.
    """
    with SessionLocal() as db:
        create_admin_user(db)

if __name__ == "__main__":
    initialize_database()
