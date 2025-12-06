# Attendance Backend API (SQL Server)

A Flask + SQLAlchemy backend wired to Microsoft SQL Server. The schema mirrors `database/ATTENDANCE.sql`, providing persistence for users, students, teachers, lectures, and lecture enrollments.

## Setup

1. Create and activate a virtual environment.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Configure SQL Server connection (defaults target `localhost:1433`):
   ```bash
   export SQLSERVER_HOST=localhost
   export SQLSERVER_PORT=1433
   export SQLSERVER_USER=sa
   export SQLSERVER_PASSWORD=YourStrong!Passw0rd
   export SQLSERVER_DATABASE=ATTENDANCE
   export SQLSERVER_DRIVER="ODBC Driver 18 for SQL Server"
   # or provide DATABASE_URL directly if you already have a full SQLAlchemy URI
   ```
4. Create the schema in your SQL Server instance (once per database):
   ```bash
   sqlcmd -S ${SQLSERVER_HOST},${SQLSERVER_PORT} -U ${SQLSERVER_USER} -P ${SQLSERVER_PASSWORD} -d ${SQLSERVER_DATABASE} -i database/ATTENDANCE.sql
   ```
5. Run the API server:
   ```bash
   python -m backend.app
   ```

The server listens on `http://0.0.0.0:5000` by default. Override with `PORT`.

## Available Endpoints

- `GET /api/health` — health check (includes DB connectivity flag).
- `POST /api/users` — create a user (roles: `Admin`, `Teacher`, `Student`).
- `GET /api/users` — list users, optionally filter by `?role=`.
- `POST /api/students` — create a student profile for a `Student` user (requires `face_embeddings`).
- `GET /api/students` — list students with user info.
- `POST /api/teachers` — create a teacher profile for a `Teacher` user.
- `GET /api/teachers` — list teachers with user info.
- `POST /api/lectures` — create a lecture/course, optionally assigning a teacher.
- `GET /api/lectures` — list lectures.
- `GET /api/lectures/<id>` — lecture details plus enrollments.
- `POST /api/lectures/<id>/assign-teacher` — assign a teacher to a lecture.
- `POST /api/lectures/<id>/enroll` — enroll a user (student or teacher) into a lecture.
- `GET /api/enrollments` — list enrollments with lecture + user context.

All endpoints accept and return JSON.

## Database Notes

- Passwords are stored as hashes via `werkzeug.security.generate_password_hash`.
- Relationships enforce that students/teachers must be linked to users with the matching role.
- Enrollment uniqueness is enforced per user per lecture (matching `User_Lecture` primary key in `ATTENDANCE.sql`).
