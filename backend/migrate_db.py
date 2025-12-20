
import sys
import os

# Ensure we can import from the current directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import app, db
    from models import Lecture
    from sqlalchemy import text
except ImportError as e:
    print(f"Import Error: {e}")
    print("Please make sure you are running this script from the 'backend' directory.")
    sys.exit(1)

def migrate():
    print("Starting migration...")
    with app.app_context():
        # 1. Add 'schedule' column if it doesn't exist
        try:
            with db.engine.connect() as conn:
                print("Attempting to add 'schedule' column to Lecture table...")
                conn.execute(text("ALTER TABLE Lecture ADD schedule NVARCHAR(MAX)"))
                conn.commit()
                print("Successfully added 'schedule' column.")
        except Exception as e:
            if "Column names in each table must be unique" in str(e):
                print("'schedule' column already exists.")
            else:
                print(f"Note regarding column addition (might be okay if already exists): {e}")

        # 2. Populate empty schedules
        try:
            print("Forcing update of ALL schedules to 'Monday, Wednesday'...")
            updated = Lecture.query.update({'schedule': 'Monday, Wednesday'}, synchronize_session=False)
            db.session.commit()
            print(f"Successfully updated/backfilled {updated} lectures.")
        except Exception as e:
            print(f"Error updating data: {e}")

if __name__ == "__main__":
    migrate()
