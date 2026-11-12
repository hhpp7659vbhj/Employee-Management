-- ==============================================================
-- ZOOGLE ENTERPRISE EMS - INDIAN ENTERPRISE SEED DATA (SQL DML)
-- ==============================================================

INSERT INTO departments (id, code, name, description, head_of_dept, budget, room_number, employee_count) VALUES
('DEP-01', 'ENG', 'Engineering & Tech', 'Core software platform, microservices, AI & Cloud Infrastructure', 'Dheeraj Raj', 9500000.00, 'Floor 4 - Tech Bay (Bangalore)', 3),
('DEP-02', 'HR', 'People & Culture', 'Talent acquisition, employee welfare, compensation & relations', 'Priya Nair', 3500000.00, 'Floor 2 - Suite 201 (Mumbai)', 1),
('DEP-03', 'FIN', 'Finance & Strategy', 'Financial planning, accounting, tax audits & treasury', 'Rohan Deshmukh', 4800000.00, 'Floor 3 - Suite 305 (Delhi NCR)', 1),
('DEP-04', 'DES', 'Product & Design', 'UI/UX, human factors, mobile design systems & brand experience', 'Pooja Sharma', 5200000.00, 'Floor 4 - Studio 412 (Bangalore)', 1),
('DEP-05', 'MKT', 'Marketing & Growth', 'Brand communications, digital outreach, corporate PR & campaigns', 'Rahul Roy', 6000000.00, 'Floor 2 - Studio B (Gurugram)', 1),
('DEP-06', 'OPS', 'Global Operations', 'Workplace logistics, facility security, vendor management & IT ops', 'Kavita Sundaram', 3200000.00, 'Floor 1 - Hub 104 (Hyderabad)', 1);

INSERT INTO users (id, username, password, role, employee_id, full_name, email, avatar, status) VALUES
('USR-ADM-01', 'admin', 'admin123', 'ADMIN', NULL, 'Rajeshwar Verma', 'rajeshwar.verma@zoogle.in', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'ACTIVE');
