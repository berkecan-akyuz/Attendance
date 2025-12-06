# Attendance Backend API

A lightweight Flask + SQLAlchemy backend that provides basic persistence for users, students, teachers, courses, and enrollments. By default, it uses a local SQLite database (`attendance.db`), but you can point it to any SQLAlchemy-compatible database by setting `DATABASE_URL`.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Run the API server:
   ```bash
   python -m backend.app
   ```

The server will start on `http://0.0.0.0:5000` by default. Override the port with the `PORT` environment variable.

## Available Endpoints

- `GET /api/health` — health check.
- `POST /api/users` — create a user (roles: `admin`, `teacher`, `student`).
- `GET /api/users` — list users, optionally filter by `?role=`.
- `POST /api/students` — create a student profile for a `student` user.
- `GET /api/students` — list students with user info.
- `POST /api/teachers` — create a teacher profile for a `teacher` user.
- `GET /api/teachers` — list teachers with user info.
- `POST /api/courses` — create a course, optionally assigning a teacher.
- `GET /api/courses` — list courses.
- `GET /api/courses/<id>` — course details plus enrollments.
- `POST /api/courses/<id>/assign-teacher` — assign a teacher to a course.
- `POST /api/courses/<id>/enroll` — enroll a student (`user_id` + `student_id`) into a course.
- `GET /api/enrollments` — list enrollments with course + student context.

All endpoints accept and return JSON.

## Database Notes

- Passwords are stored as hashes via `werkzeug.security.generate_password_hash`.
- Relationships enforce that students/teachers must be linked to users with the matching role.
- Enrollment uniqueness is enforced per student per course.
