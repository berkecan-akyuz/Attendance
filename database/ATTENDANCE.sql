CREATE TABLE [User] (
    user_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Admin', 'Teacher', 'Student')),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NULL,
    phone VARCHAR(20) NULL,
    profile_picture VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME NULL,
    is_active BIT DEFAULT 1
);

CREATE INDEX idx_user_username ON [User](username);
CREATE INDEX idx_user_role ON [User](role);
CREATE INDEX idx_user_email ON [User](email);
CREATE INDEX idx_user_active ON [User](is_active);

GO

CREATE TABLE Student (
    student_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100) NULL,
    registration_date DATETIME DEFAULT GETDATE(),
    registered_by INT NULL,
    face_embeddings NVARCHAR(MAX) NOT NULL, -- JSON data
    face_image_path VARCHAR(255) NULL,
    enrollment_status VARCHAR(20) DEFAULT 'Active' CHECK (enrollment_status IN ('Active', 'Inactive', 'Graduated', 'Suspended')),
    
    CONSTRAINT FK_Student_User FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    CONSTRAINT FK_Student_RegisteredBy FOREIGN KEY (registered_by) REFERENCES [User](user_id)
);

CREATE INDEX idx_student_user ON Student(user_id);
CREATE INDEX idx_student_roll ON Student(roll_number);
CREATE INDEX idx_student_dept ON Student(department);
CREATE INDEX idx_student_status ON Student(enrollment_status);

GO

CREATE TABLE Teacher (
    teacher_id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    department VARCHAR(100) NULL,
    specialization VARCHAR(200) NULL,
    date_joined DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Teacher_User FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);

CREATE INDEX idx_teacher_user ON Teacher(user_id);
CREATE INDEX idx_teacher_dept ON Teacher(department);

GO

CREATE TABLE Lecture (
    lecture_id INT IDENTITY(1,1) PRIMARY KEY,
    lecture_name VARCHAR(100) NOT NULL,
    course_code VARCHAR(50) NULL,
    department VARCHAR(100) NULL,
    is_active BIT DEFAULT 1,
    teacher_id INT NULL,
    semester INT NULL,
    year INT NULL,
    schedule NVARCHAR(MAX) NULL, -- JSON data for schedule
    room_number VARCHAR(50) NULL,
    capacity INT NULL,
    credits INT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Lecture_Teacher FOREIGN KEY (teacher_id) REFERENCES Teacher(teacher_id)
);

CREATE INDEX idx_lecture_teacher ON Lecture(teacher_id);
CREATE INDEX idx_lecture_active ON Lecture(is_active);
CREATE INDEX idx_lecture_code ON Lecture(course_code);
CREATE INDEX idx_lecture_dept ON Lecture(department);
CREATE INDEX idx_lecture_semester ON Lecture(semester, year);

GO

CREATE TABLE User_Lecture (
    user_id INT NOT NULL,
    lecture_id INT NOT NULL,
    is_teacher BIT DEFAULT 0,
    enrolled_at DATETIME DEFAULT GETDATE(),
    enrollment_status VARCHAR(20) DEFAULT 'Active' CHECK (enrollment_status IN ('Active', 'Dropped', 'Completed')),
    
    PRIMARY KEY (user_id, lecture_id),
    CONSTRAINT FK_UserLecture_User FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE,
    CONSTRAINT FK_UserLecture_Lecture FOREIGN KEY (lecture_id) REFERENCES Lecture(lecture_id) ON DELETE CASCADE
);

CREATE INDEX idx_userlecture_user ON User_Lecture(user_id);
CREATE INDEX idx_userlecture_lecture ON User_Lecture(lecture_id);
CREATE INDEX idx_userlecture_isteacher ON User_Lecture(is_teacher);
CREATE INDEX idx_userlecture_status ON User_Lecture(enrollment_status);

GO

CREATE TABLE Camera (
    camera_id INT IDENTITY(1,1) PRIMARY KEY,
    camera_name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    stream_url VARCHAR(255) NOT NULL,
    assigned_lecture_id INT NULL,
    status VARCHAR(20) DEFAULT 'Online' CHECK (status IN ('Online', 'Offline', 'Error', 'Maintenance')),
    last_checked DATETIME NULL,
    
    CONSTRAINT FK_Camera_Lecture FOREIGN KEY (assigned_lecture_id) REFERENCES Lecture(lecture_id)
);

CREATE INDEX idx_camera_lecture ON Camera(assigned_lecture_id);
CREATE INDEX idx_camera_status ON Camera(status);
CREATE INDEX idx_camera_location ON Camera(location);

GO

CREATE TABLE Attendance_Session (
    session_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    lecture_id INT NOT NULL,
    camera_id INT NULL,
    session_date DATE NOT NULL,
    session_start_time TIME NULL,
    session_end_time TIME NULL,
    status VARCHAR(20) DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    attendance_locked BIT DEFAULT 0,
    locked_by INT NULL,
    locked_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    completed_at DATETIME NULL,
    notes NVARCHAR(MAX) NULL,
    
    CONSTRAINT FK_AttendanceSession_Lecture FOREIGN KEY (lecture_id) REFERENCES Lecture(lecture_id),
    CONSTRAINT FK_AttendanceSession_Camera FOREIGN KEY (camera_id) REFERENCES Camera(camera_id),
    CONSTRAINT FK_AttendanceSession_LockedBy FOREIGN KEY (locked_by) REFERENCES [User](user_id),
    CONSTRAINT UQ_Session_Lecture_DateTime UNIQUE (lecture_id, session_date, session_start_time)
);

CREATE INDEX idx_session_lecture ON Attendance_Session(lecture_id);
CREATE INDEX idx_session_date ON Attendance_Session(session_date);
CREATE INDEX idx_session_lecture_date ON Attendance_Session(lecture_id, session_date);
CREATE INDEX idx_session_status ON Attendance_Session(status);

GO

CREATE TABLE Student_Attendance (
    attendance_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    session_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    time_in TIME NULL,
    time_out TIME NULL,
    status VARCHAR(20) DEFAULT 'Absent' CHECK (status IN ('Present', 'Absent', 'Late', 'Unknown', 'Excused')),
    verification_method VARCHAR(30) DEFAULT 'Face Recognition' CHECK (verification_method IN ('Face Recognition', 'Manual', 'RFID', 'QR Code', 'Fingerprint')),
    verified_by INT NULL,
    confidence_score FLOAT NULL,
    manual_override BIT DEFAULT 0,
    edited_by INT NULL,
    edited_at DATETIME NULL,
    created_at DATETIME DEFAULT GETDATE(),
    notes NVARCHAR(MAX) NULL,
    
    CONSTRAINT FK_StudentAttendance_Session FOREIGN KEY (session_id) REFERENCES Attendance_Session(session_id) ON DELETE CASCADE,
    CONSTRAINT FK_StudentAttendance_User FOREIGN KEY (user_id) REFERENCES [User](user_id),
    CONSTRAINT FK_StudentAttendance_VerifiedBy FOREIGN KEY (verified_by) REFERENCES [User](user_id),
    CONSTRAINT FK_StudentAttendance_EditedBy FOREIGN KEY (edited_by) REFERENCES [User](user_id),
    CONSTRAINT UQ_Session_User UNIQUE (session_id, user_id)
);

CREATE INDEX idx_attendance_session ON Student_Attendance(session_id);
CREATE INDEX idx_attendance_user ON Student_Attendance(user_id);
CREATE INDEX idx_attendance_status ON Student_Attendance(status);
CREATE INDEX idx_attendance_session_user ON Student_Attendance(session_id, user_id);

GO

CREATE TABLE Face_dataset (
    image_id INT IDENTITY(1,1) PRIMARY KEY,
    student_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    capture_device VARCHAR(100) NULL,
    capture_date DATETIME DEFAULT GETDATE(),
    quality_score FLOAT NULL,
    
    CONSTRAINT FK_FaceDataset_Student FOREIGN KEY (student_id) REFERENCES Student(student_id) ON DELETE CASCADE
);

CREATE INDEX idx_face_student ON Face_dataset(student_id);
CREATE INDEX idx_face_quality ON Face_dataset(quality_score);

GO

CREATE TABLE Notification (
    notification_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN ('attendance', 'system_error', 'camera_offline', 'low_accuracy', 'storage_warning', 'daily_summary', 'absent_alert', 'correction_request')),
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(200) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'dismissed')),
    related_entity_type VARCHAR(50) NULL,
    related_entity_id INT NULL,
    action_url VARCHAR(255) NULL,
    created_at DATETIME DEFAULT GETDATE(),
    read_at DATETIME NULL,
    
    CONSTRAINT FK_Notification_User FOREIGN KEY (user_id) REFERENCES [User](user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_user_status ON Notification(user_id, status);
CREATE INDEX idx_notification_created ON Notification(created_at);
CREATE INDEX idx_notification_type ON Notification(type, priority);

GO

CREATE TABLE Log (
    log_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    user_id INT NULL,
    severity VARCHAR(10) DEFAULT 'Info' CHECK (severity IN ('Info', 'Warning', 'Error', 'Critical')),
    ip_address VARCHAR(45) NULL,
    timestamp DATETIME DEFAULT GETDATE(),
    
    CONSTRAINT FK_Log_User FOREIGN KEY (user_id) REFERENCES [User](user_id)
);

CREATE INDEX idx_log_timestamp ON Log(timestamp);
CREATE INDEX idx_log_severity ON Log(severity);
CREATE INDEX idx_log_event ON Log(event_type);
CREATE INDEX idx_log_user ON Log(user_id);

GO

CREATE TABLE Attendance_Correction_Request (
    request_id INT IDENTITY(1,1) PRIMARY KEY,
    attendance_id BIGINT NOT NULL,
    requesting_user_id INT NOT NULL,
    reason NVARCHAR(MAX) NOT NULL,
    requested_at DATETIME DEFAULT GETDATE(),
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    review_notes NVARCHAR(MAX) NULL,
    
    CONSTRAINT FK_CorrectionRequest_Attendance FOREIGN KEY (attendance_id) REFERENCES Student_Attendance(attendance_id) ON DELETE CASCADE,
    CONSTRAINT FK_CorrectionRequest_RequestingUser FOREIGN KEY (requesting_user_id) REFERENCES [User](user_id),
    CONSTRAINT FK_CorrectionRequest_ReviewedBy FOREIGN KEY (reviewed_by) REFERENCES [User](user_id)
);

CREATE INDEX idx_correction_attendance ON Attendance_Correction_Request(attendance_id);
CREATE INDEX idx_correction_requesting ON Attendance_Correction_Request(requesting_user_id);
CREATE INDEX idx_correction_status ON Attendance_Correction_Request(status);
CREATE INDEX idx_correction_reviewed ON Attendance_Correction_Request(reviewed_by);

GO
