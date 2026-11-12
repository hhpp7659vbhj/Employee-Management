-- ==============================================================
-- ZOOGLE ENTERPRISE EMS - RELATIONAL DATABASE SCHEMA (SQL DDL)
-- Compatible with MySQL 8.0+, PostgreSQL, and SQLite
-- ==============================================================

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    head_of_dept VARCHAR(128),
    budget DECIMAL(15, 2) DEFAULT 0.00,
    room_number VARCHAR(64),
    employee_count INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS employees (
    id VARCHAR(32) PRIMARY KEY,
    emp_code VARCHAR(32) NOT NULL UNIQUE,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    email VARCHAR(128) NOT NULL UNIQUE,
    phone VARCHAR(32),
    department VARCHAR(128) NOT NULL,
    designation VARCHAR(128) NOT NULL,
    salary DECIMAL(12, 2) NOT NULL,
    joining_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'Active',
    address TEXT,
    emergency_contact VARCHAR(64),
    avatar TEXT,
    bio TEXT,
    skills TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE')),
    employee_id VARCHAR(32),
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    avatar TEXT,
    status VARCHAR(32) DEFAULT 'ACTIVE',
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(32) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL,
    emp_name VARCHAR(128) NOT NULL,
    date DATE NOT NULL,
    clock_in VARCHAR(32),
    clock_out VARCHAR(32),
    work_hours DECIMAL(4, 2) DEFAULT 0.00,
    status VARCHAR(32) NOT NULL CHECK (status IN ('Present', 'Late', 'Half Day', 'Absent')),
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(32) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL,
    emp_name VARCHAR(128) NOT NULL,
    leave_type VARCHAR(64) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    applied_at VARCHAR(32) NOT NULL,
    reviewed_by VARCHAR(128),
    review_comment TEXT,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payroll (
    id VARCHAR(32) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL,
    emp_name VARCHAR(128) NOT NULL,
    month_year VARCHAR(32) NOT NULL,
    basic_salary DECIMAL(12, 2) NOT NULL,
    allowances DECIMAL(12, 2) DEFAULT 0.00,
    deductions DECIMAL(12, 2) DEFAULT 0.00,
    tax DECIMAL(12, 2) DEFAULT 0.00,
    net_salary DECIMAL(12, 2) NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING' CHECK (status IN ('PAID', 'PENDING')),
    payment_date VARCHAR(32),
    slip_number VARCHAR(64) UNIQUE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(32) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL,
    emp_name VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(16) DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'TO_DO' CHECK (status IN ('TO_DO', 'IN_PROGRESS', 'COMPLETED')),
    created_at DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notices (
    id VARCHAR(32) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN ('General', 'Urgent', 'Event', 'Policy')),
    content TEXT NOT NULL,
    author VARCHAR(128) NOT NULL,
    created_at DATE NOT NULL,
    pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS performance_reviews (
    id VARCHAR(32) PRIMARY KEY,
    employee_id VARCHAR(32) NOT NULL,
    emp_name VARCHAR(128) NOT NULL,
    review_period VARCHAR(32) NOT NULL,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    goals_met TEXT,
    feedback TEXT,
    reviewer VARCHAR(128) NOT NULL,
    date DATE NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);
