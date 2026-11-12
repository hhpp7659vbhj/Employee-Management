package com.zoogle.ems.db;

import com.zoogle.ems.model.*;
import com.zoogle.ems.service.JsonUtil;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class Database {
    private static Database instance;
    private static final String DATA_FILE = "data/database.json";
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    private final Map<String, User> users = new LinkedHashMap<>();
    private final Map<String, Employee> employees = new LinkedHashMap<>();
    private final Map<String, Department> departments = new LinkedHashMap<>();
    private final Map<String, Attendance> attendance = new LinkedHashMap<>();
    private final Map<String, LeaveRequest> leaves = new LinkedHashMap<>();
    private final Map<String, Payroll> payrolls = new LinkedHashMap<>();
    private final Map<String, TaskItem> tasks = new LinkedHashMap<>();
    private final Map<String, Notice> notices = new LinkedHashMap<>();
    private final Map<String, PerformanceReview> reviews = new LinkedHashMap<>();

    private Database() {
        File dataDir = new File("data");
        if (!dataDir.exists()) {
            dataDir.mkdirs();
        }
        if (new File(DATA_FILE).exists()) {
            loadFromFile();
        } else {
            seedInitialData();
            saveToFile();
        }
    }

    public static synchronized Database getInstance() {
        if (instance == null) {
            instance = new Database();
        }
        return instance;
    }

    // ================= PERSISTENCE =================

    public void saveToFile() {
        lock.writeLock().lock();
        try {
            Map<String, Object> root = new LinkedHashMap<>();
            root.put("users", new ArrayList<>(users.values()));
            root.put("employees", new ArrayList<>(employees.values()));
            root.put("departments", new ArrayList<>(departments.values()));
            root.put("attendance", new ArrayList<>(attendance.values()));
            root.put("leaves", new ArrayList<>(leaves.values()));
            root.put("payrolls", new ArrayList<>(payrolls.values()));
            root.put("tasks", new ArrayList<>(tasks.values()));
            root.put("notices", new ArrayList<>(notices.values()));
            root.put("reviews", new ArrayList<>(reviews.values()));

            String json = JsonUtil.toJson(root);
            Path target = Paths.get(DATA_FILE);
            Path temp = Paths.get(DATA_FILE + ".tmp");
            Files.writeString(temp, json, StandardCharsets.UTF_8);
            Files.move(temp, target, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
        } catch (Exception e) {
            System.err.println("[Database] Error persisting data: " + e.getMessage());
            e.printStackTrace();
        } finally {
            lock.writeLock().unlock();
        }
    }

    @SuppressWarnings("unchecked")
    public void loadFromFile() {
        lock.writeLock().lock();
        try {
            String json = Files.readString(Paths.get(DATA_FILE), StandardCharsets.UTF_8);
            Map<String, Object> root = JsonUtil.parseObject(json);

            users.clear();
            List<Object> userList = (List<Object>) root.get("users");
            if (userList != null) {
                for (Object item : userList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    User u = new User(
                        (String) m.get("id"), (String) m.get("username"), (String) m.get("password"),
                        (String) m.get("role"), (String) m.get("employeeId"), (String) m.get("fullName"),
                        (String) m.get("email"), (String) m.get("avatar"), (String) m.get("status")
                    );
                    users.put(u.getId(), u);
                }
            }

            employees.clear();
            List<Object> empList = (List<Object>) root.get("employees");
            if (empList != null) {
                for (Object item : empList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    Employee emp = new Employee(
                        (String) m.get("id"), (String) m.get("empCode"), (String) m.get("firstName"),
                        (String) m.get("lastName"), (String) m.get("email"), (String) m.get("phone"),
                        (String) m.get("department"), (String) m.get("designation"),
                        toDouble(m.get("salary")), (String) m.get("joiningDate"), (String) m.get("status"),
                        (String) m.get("address"), (String) m.get("emergencyContact"), (String) m.get("avatar"),
                        (String) m.get("bio"), (String) m.get("skills")
                    );
                    employees.put(emp.getId(), emp);
                }
            }

            departments.clear();
            List<Object> deptList = (List<Object>) root.get("departments");
            if (deptList != null) {
                for (Object item : deptList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    Department d = new Department(
                        (String) m.get("id"), (String) m.get("code"), (String) m.get("name"),
                        (String) m.get("description"), (String) m.get("headOfDept"),
                        toDouble(m.get("budget")), (String) m.get("roomNumber"),
                        toInt(m.get("employeeCount"))
                    );
                    departments.put(d.getId(), d);
                }
            }

            attendance.clear();
            List<Object> attList = (List<Object>) root.get("attendance");
            if (attList != null) {
                for (Object item : attList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    Attendance a = new Attendance(
                        (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
                        (String) m.get("date"), (String) m.get("clockIn"), (String) m.get("clockOut"),
                        toDouble(m.get("workHours")), (String) m.get("status"), (String) m.get("notes")
                    );
                    attendance.put(a.getId(), a);
                }
            }

            leaves.clear();
            List<Object> leaveList = (List<Object>) root.get("leaves");
            if (leaveList != null) {
                for (Object item : leaveList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    LeaveRequest l = new LeaveRequest(
                        (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
                        (String) m.get("leaveType"), (String) m.get("startDate"), (String) m.get("endDate"),
                        toInt(m.get("days")), (String) m.get("reason"), (String) m.get("status"),
                        (String) m.get("appliedAt"), (String) m.get("reviewedBy"), (String) m.get("reviewComment")
                    );
                    leaves.put(l.getId(), l);
                }
            }

            payrolls.clear();
            List<Object> payList = (List<Object>) root.get("payrolls");
            if (payList != null) {
                for (Object item : payList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    Payroll p = new Payroll(
                        (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
                        (String) m.get("monthYear"), toDouble(m.get("basicSalary")),
                        toDouble(m.get("allowances")), toDouble(m.get("deductions")),
                        toDouble(m.get("tax")), toDouble(m.get("netSalary")),
                        (String) m.get("status"), (String) m.get("paymentDate"), (String) m.get("slipNumber")
                    );
                    payrolls.put(p.getId(), p);
                }
            }

            tasks.clear();
            List<Object> taskList = (List<Object>) root.get("tasks");
            if (taskList != null) {
                for (Object item : taskList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    TaskItem t = new TaskItem(
                        (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
                        (String) m.get("title"), (String) m.get("description"), (String) m.get("priority"),
                        (String) m.get("dueDate"), (String) m.get("status"), (String) m.get("createdAt")
                    );
                    tasks.put(t.getId(), t);
                }
            }

            notices.clear();
            List<Object> noticeList = (List<Object>) root.get("notices");
            if (noticeList != null) {
                for (Object item : noticeList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    Notice n = new Notice(
                        (String) m.get("id"), (String) m.get("title"), (String) m.get("category"),
                        (String) m.get("content"), (String) m.get("author"), (String) m.get("createdAt"),
                        Boolean.TRUE.equals(m.get("pinned"))
                    );
                    notices.put(n.getId(), n);
                }
            }

            reviews.clear();
            List<Object> revList = (List<Object>) root.get("reviews");
            if (revList != null) {
                for (Object item : revList) {
                    Map<String, Object> m = (Map<String, Object>) item;
                    PerformanceReview r = new PerformanceReview(
                        (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
                        (String) m.get("reviewPeriod"), toInt(m.get("rating")), (String) m.get("goalsMet"),
                        (String) m.get("feedback"), (String) m.get("reviewer"), (String) m.get("date")
                    );
                    reviews.put(r.getId(), r);
                }
            }

            System.out.println("[Database] Loaded existing database records successfully.");
        } catch (Exception e) {
            System.err.println("[Database] Failed to read database.json, re-seeding: " + e.getMessage());
            seedInitialData();
            saveToFile();
        } finally {
            lock.writeLock().unlock();
        }
    }

    private double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception e) { return 0.0; }
    }

    private int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        try { return Integer.parseInt(o.toString()); } catch (Exception e) { return 0; }
    }

    // ================= INITIAL SEEDING (INDIAN ENTERPRISE) =================

    public void seedInitialData() {
        users.clear();
        employees.clear();
        departments.clear();
        attendance.clear();
        leaves.clear();
        payrolls.clear();
        tasks.clear();
        notices.clear();
        reviews.clear();

        // 1. Admin user (Rajeshwar Verma - Chief Executive Admin)
        User admin = new User(
            "USR-ADM-01", "admin", "admin123", "ADMIN", null,
            "Rajeshwar Verma", "rajeshwar.verma@zoogle.in",
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            "ACTIVE"
        );
        users.put(admin.getId(), admin);

        // 2. Departments
        Department d1 = new Department("DEP-01", "ENG", "Engineering & Tech", "Core software platform, microservices, AI & Cloud Infrastructure", "Dheeraj Raj", 9500000.0, "Floor 4 - Tech Bay (Bangalore)", 3);
        Department d2 = new Department("DEP-02", "HR", "People & Culture", "Talent acquisition, employee welfare, compensation & relations", "Priya Nair", 3500000.0, "Floor 2 - Suite 201 (Mumbai)", 1);
        Department d3 = new Department("DEP-03", "FIN", "Finance & Strategy", "Financial planning, accounting, tax audits & treasury", "Rohan Deshmukh", 4800000.0, "Floor 3 - Suite 305 (Delhi NCR)", 1);
        Department d4 = new Department("DEP-04", "DES", "Product & Design", "UI/UX, human factors, mobile design systems & brand experience", "Pooja Sharma", 5200000.0, "Floor 4 - Studio 412 (Bangalore)", 1);
        Department d5 = new Department("DEP-05", "MKT", "Marketing & Growth", "Brand communications, digital outreach, corporate PR & campaigns", "Rahul Roy", 6000000.0, "Floor 2 - Studio B (Gurugram)", 1);
        Department d6 = new Department("DEP-06", "OPS", "Global Operations", "Workplace logistics, facility security, vendor management & IT ops", "Kavita Sundaram", 3200000.0, "Floor 1 - Hub 104 (Hyderabad)", 1);

        departments.put(d1.getId(), d1);
        departments.put(d2.getId(), d2);
        departments.put(d3.getId(), d3);
        departments.put(d4.getId(), d4);
        departments.put(d5.getId(), d5);
        departments.put(d6.getId(), d6);

        // 3. Indian Employees & their login credentials
        String[][] empData = {
            {"EMP-101", "ZOO-101", "Dheeraj", "Raj", "dheeraj.raj@zoogle.in", "+91 98201 44521", "Engineering & Tech", "Staff Software Engineer", "1850000", "2023-03-15", "Active", "B-402, Palm Meadows, Whitefield, Bangalore", "+91 98201 11223", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80", "Architecting high-scale distributed backend services & Java microservices at Zoogle.", "Java 21/26, Spring Boot, Microservices, Kubernetes, SQL, Kafka", "dheeraj.raj", "zoogle123"},
            {"EMP-102", "ZOO-102", "Pooja", "Sharma", "pooja.sharma@zoogle.in", "+91 97112 88390", "Product & Design", "Lead UI/UX Architect", "1650000", "2023-06-20", "Active", "12/A, Indiranagar 100ft Road, Bangalore", "+91 97112 99887", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80", "Passionate about crafting intuitive enterprise design systems and micro-interactions.", "Figma, Design Systems, UX Research, Tailwind CSS, Accessibility", "pooja.sharma", "zoogle123"},
            {"EMP-103", "ZOO-103", "Rahul", "Roy", "rahul.roy@zoogle.in", "+91 98334 12099", "Marketing & Growth", "Head of Brand Marketing", "1550000", "2024-01-10", "Active", "704 Cyber City Heights, DLF Phase 2, Gurugram", "+91 98334 77665", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80", "Leading Zoogle's pan-India brand growth, enterprise tech summits and outreach.", "Brand Strategy, Performance Marketing, SEO/SEM, Enterprise PR", "rahul.roy", "zoogle123"},
            {"EMP-104", "ZOO-104", "Ananya", "Iyer", "ananya.iyer@zoogle.in", "+91 99401 55620", "Engineering & Tech", "VP of Engineering & Tech", "2400000", "2022-01-10", "Active", "55 Mount Road, Guindy, Chennai", "+91 99401 33221", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80", "Engineering leadership, distributed systems resilience, and AI tech stack scaling.", "Cloud Architecture, Go, Java, High Scalability, Engineering Leadership", "ananya.iyer", "zoogle123"},
            {"EMP-105", "ZOO-105", "Rohan", "Deshmukh", "rohan.deshmukh@zoogle.in", "+91 98220 99411", "Finance & Strategy", "Lead Financial Controller", "1700000", "2024-02-15", "Active", "Flat 801, Bandra Kurla Complex, Mumbai", "+91 98220 55443", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80", "Corporate financial planning, Indian GST & TDS compliance, auditing and treasury.", "Financial Modeling, GST Compliance, Tax Structuring, Auditing, ERP", "rohan.deshmukh", "zoogle123"},
            {"EMP-106", "ZOO-106", "Priya", "Nair", "priya.nair@zoogle.in", "+91 98450 77123", "People & Culture", "Director of Human Resources", "1600000", "2023-08-01", "Active", "Green Glen Layout, Bellandur, Bangalore", "+91 98450 66554", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80", "Championing employee welfare, progressive workplace policies and talent retention.", "People Analytics, Culture Building, HR Tech, Executive Coaching", "priya.nair", "zoogle123"},
            {"EMP-107", "ZOO-107", "Arjun", "Mehta", "arjun.mehta@zoogle.in", "+91 98199 44321", "Engineering & Tech", "Senior Cloud DevOps Engineer", "1750000", "2024-04-12", "On Leave", "B-14 Powai Lake Enclave, Mumbai", "+91 98199 11998", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80", "Automating hybrid multi-cloud deployments, monitoring, and 99.99% uptime.", "Kubernetes, Terraform, AWS, CI/CD, Linux Kernel, Prometheus", "arjun.mehta", "zoogle123"},
            {"EMP-108", "ZOO-108", "Kavita", "Sundaram", "kavita.sundaram@zoogle.in", "+91 98840 22190", "Global Operations", "Operations Lead", "1350000", "2025-01-18", "Active", "Madhapur Hitec City, Hyderabad", "+91 98840 88776", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80", "Overseeing smart office facilities, turnstile biometric security and logistics.", "Logistics, Vendor Management, Agile Operations, Facility IT", "kavita.sundaram", "zoogle123"}
        };

        for (String[] row : empData) {
            Employee emp = new Employee(
                row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7],
                Double.parseDouble(row[8]), row[9], row[10], row[11], row[12], row[13], row[14], row[15]
            );
            employees.put(emp.getId(), emp);

            User user = new User(
                "USR-" + row[0], row[16], row[17], "EMPLOYEE", emp.getId(),
                emp.getFullName(), emp.getEmail(), emp.getAvatar(), "ACTIVE"
            );
            users.put(user.getId(), user);
        }

        // 4. Attendance sample records
        LocalDate today = LocalDate.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        attendance.put("ATT-01", new Attendance("ATT-01", "EMP-101", "Dheeraj Raj", today.format(fmt), "09:05 AM", "", 0.0, "Present", "QR Code Scanned at Bangalore Gate A"));
        attendance.put("ATT-02", new Attendance("ATT-02", "EMP-102", "Pooja Sharma", today.format(fmt), "08:55 AM", "", 0.0, "Present", "QR Code Scanned at Bangalore Studio 4"));
        attendance.put("ATT-03", new Attendance("ATT-03", "EMP-103", "Rahul Roy", today.format(fmt), "09:12 AM", "", 0.0, "Present", "QR Code Scanned at Gurugram Hub"));
        attendance.put("ATT-04", new Attendance("ATT-04", "EMP-104", "Ananya Iyer", today.format(fmt), "08:45 AM", "", 0.0, "Present", "Executive Turnstile QR Scanned"));
        attendance.put("ATT-05", new Attendance("ATT-05", "EMP-105", "Rohan Deshmukh", today.format(fmt), "09:35 AM", "", 0.0, "Late", "QR Scanned (BKC Metro Delay)"));
        attendance.put("ATT-06", new Attendance("ATT-06", "EMP-106", "Priya Nair", today.format(fmt), "09:00 AM", "", 0.0, "Present", "QR Code Scanned at HR Reception"));
        attendance.put("ATT-07", new Attendance("ATT-07", "EMP-107", "Arjun Mehta", today.format(fmt), "-", "-", 0.0, "Absent", "Approved Medical Leave"));
        attendance.put("ATT-08", new Attendance("ATT-08", "EMP-108", "Kavita Sundaram", today.format(fmt), "09:10 AM", "", 0.0, "Present", "QR Code Scanned at Hyderabad Hub"));

        // Previous day completed attendance
        LocalDate yesterday = today.minusDays(1);
        attendance.put("ATT-09", new Attendance("ATT-09", "EMP-101", "Dheeraj Raj", yesterday.format(fmt), "09:02 AM", "06:15 PM", 9.2, "Present", "Full day sprint"));
        attendance.put("ATT-10", new Attendance("ATT-10", "EMP-102", "Pooja Sharma", yesterday.format(fmt), "08:50 AM", "06:05 PM", 9.2, "Present", "Design review sprint"));

        // 5. Leave Requests
        leaves.put("LEV-01", new LeaveRequest(
            "LEV-01", "EMP-101", "Dheeraj Raj", "Casual",
            today.plusDays(4).format(fmt), today.plusDays(6).format(fmt), 3,
            "Attending sibling's wedding ceremony in Jaipur.", "PENDING",
            today.minusDays(1).format(fmt) + " 14:30", "", ""
        ));
        leaves.put("LEV-02", new LeaveRequest(
            "LEV-02", "EMP-102", "Pooja Sharma", "Annual",
            today.plusDays(10).format(fmt), today.plusDays(15).format(fmt), 5,
            "Family trip to Kerala backwaters with confirmed train & hotel bookings.", "PENDING",
            today.minusDays(2).format(fmt) + " 10:15", "", ""
        ));
        leaves.put("LEV-03", new LeaveRequest(
            "LEV-03", "EMP-107", "Arjun Mehta", "Sick",
            today.minusDays(1).format(fmt), today.plusDays(2).format(fmt), 4,
            "Viral flu recovery under doctor advice.", "APPROVED",
            today.minusDays(2).format(fmt) + " 08:30", "Priya Nair", "Get well soon Arjun. Take good rest."
        ));
        leaves.put("LEV-04", new LeaveRequest(
            "LEV-04", "EMP-105", "Rohan Deshmukh", "Casual",
            today.minusDays(10).format(fmt), today.minusDays(9).format(fmt), 2,
            "Home renovation and registry verification in Pune.", "APPROVED",
            today.minusDays(14).format(fmt) + " 11:20", "Priya Nair", "Approved as per leave balance."
        ));

        // 6. Payroll records (in INR ₹)
        String currentMonth = "October 2026";
        int paySeq = 101;
        for (Employee emp : employees.values()) {
            double basic = Math.round(emp.getSalary() / 12.0);
            double allowances = Math.round(basic * 0.25); // HRA & Special allowance
            double tax = Math.round(basic * 0.12); // TDS
            double deductions = Math.round(basic * 0.08); // PF & ESI
            double net = basic + allowances - tax - deductions;
            String status = paySeq % 3 == 0 ? "PENDING" : "PAID";
            String pDate = status.equals("PAID") ? today.minusDays(2).format(fmt) : "-";

            Payroll p = new Payroll(
                "PAY-" + paySeq, emp.getId(), emp.getFullName(), currentMonth,
                basic, allowances, deductions, tax, net, status, pDate, "ZOO-SLIP-" + paySeq
            );
            payrolls.put(p.getId(), p);
            paySeq++;
        }

        // 7. Tasks
        tasks.put("TSK-01", new TaskItem("TSK-01", "EMP-101", "Dheeraj Raj", "Build High-Throughput UPI Payment Gateway", "Develop asynchronous event-driven payment webhook receiver with Kafka.", "HIGH", today.plusDays(3).format(fmt), "IN_PROGRESS", today.minusDays(2).format(fmt)));
        tasks.put("TSK-02", new TaskItem("TSK-02", "EMP-102", "Pooja Sharma", "Redesign Zoogle Design Tokens (Maroon/Gold)", "Finalize WCAG AAA contrast ratio tokens and responsive mobile navigation components.", "HIGH", today.plusDays(2).format(fmt), "IN_PROGRESS", today.minusDays(3).format(fmt)));
        tasks.put("TSK-03", new TaskItem("TSK-03", "EMP-103", "Rahul Roy", "Zoogle 2026 India Tech Summit Outreach", "Coordinate keynote presentations, press release and sponsor kits for Bangalore tech summit.", "MEDIUM", today.plusDays(7).format(fmt), "TO_DO", today.minusDays(1).format(fmt)));
        tasks.put("TSK-04", new TaskItem("TSK-04", "EMP-105", "Rohan Deshmukh", "Q3 Corporate GST & TDS Filing Review", "Reconcile quarterly e-invoices with bank statements for KPMG audit.", "HIGH", today.plusDays(5).format(fmt), "TO_DO", today.minusDays(2).format(fmt)));
        tasks.put("TSK-05", new TaskItem("TSK-05", "EMP-108", "Kavita Sundaram", "Office QR Attendance Scanner Calibration", "Inspect entrance QR code stations across Bangalore and Hyderabad tech bays.", "LOW", today.plusDays(6).format(fmt), "COMPLETED", today.minusDays(5).format(fmt)));

        // 8. Notices / Announcements
        notices.put("NOT-01", new Notice(
            "NOT-01", "Zoogle India Annual Innovation Hackathon 2026", "Urgent",
            "The 48-hour Zoogle Global Hackathon is scheduled for next month at our Bangalore Technology Bay. Teams can pitch AI, cloud, and distributed fintech solutions. Grand prize: ₹10,00,000 innovation grant!",
            "Rajeshwar Verma (CEO Office)", today.minusDays(1).format(fmt), true
        ));
        notices.put("NOT-02", new Notice(
            "NOT-02", "Smart QR Code Attendance System Live at All Offices", "Policy",
            "Employees can now mark attendance instantly by scanning the dynamic office QR codes placed at entrance gates during working hours (08:00 AM - 08:00 PM). Ensure your mobile camera permission is enabled.",
            "Priya Nair (People & Culture)", today.minusDays(2).format(fmt), true
        ));
        notices.put("NOT-03", new Notice(
            "NOT-03", "Diwali & Festive Season Celebration Schedule", "Event",
            "Join us on Friday at 4:30 PM across all office cafeterias for Diwali celebrations, traditional dress day, and festive sweet distribution.",
            "Priya Nair (People & Culture)", today.minusDays(4).format(fmt), false
        ));
        notices.put("NOT-04", new Notice(
            "NOT-04", "Quarterly Performance Bonus & Festive Ex-Gratia", "General",
            "Zoogle exceeded Q3 targets by 22%! Festive bonuses will be disbursed with the October payroll cycle. Congratulations everyone!",
            "Rohan Deshmukh (Finance)", today.minusDays(6).format(fmt), false
        ));

        // 9. Performance Reviews
        reviews.put("REV-01", new PerformanceReview("REV-01", "EMP-101", "Dheeraj Raj", "Q3 2026", 5, "Delivered core high-concurrency microservices with 99.99% availability.", "Outstanding technical acumen, mentors new engineers, reliable problem solver.", "Ananya Iyer", today.minusDays(10).format(fmt)));
        reviews.put("REV-02", new PerformanceReview("REV-02", "EMP-102", "Pooja Sharma", "Q3 2026", 5, "Standardized enterprise design system with stunning responsive components.", "Exceptional creativity and user empathy. The UI experience is best-in-class.", "Ananya Iyer", today.minusDays(12).format(fmt)));
        reviews.put("REV-03", new PerformanceReview("REV-03", "EMP-103", "Rahul Roy", "Q3 2026", 4, "Accelerated inbound enterprise leads by 34% through targeted campaigns.", "Great strategic vision and cross-functional leadership.", "Rajeshwar Verma", today.minusDays(15).format(fmt)));

        System.out.println("[Database] Seeded initial database with Indian staff: Pooja Sharma, Dheeraj Raj, Rahul Roy, Ananya Iyer, Rohan Deshmukh, Priya Nair, Arjun Mehta, Kavita Sundaram.");
    }

    // ================= CRUD API =================

    public User authenticate(String username, String password, String expectedRole) {
        lock.readLock().lock();
        try {
            for (User u : users.values()) {
                if (u.getUsername().equalsIgnoreCase(username) && u.getPassword().equals(password)) {
                    if (expectedRole == null || u.getRole().equalsIgnoreCase(expectedRole)) {
                        return u;
                    }
                }
            }
            return null;
        } finally {
            lock.readLock().unlock();
        }
    }

    public User getUser(String id) {
        lock.readLock().lock();
        try { return users.get(id); } finally { lock.readLock().unlock(); }
    }

    public User getUserByEmployeeId(String empId) {
        lock.readLock().lock();
        try {
            for (User u : users.values()) {
                if (empId.equals(u.getEmployeeId())) return u;
            }
            return null;
        } finally {
            lock.readLock().unlock();
        }
    }

    public List<Employee> getEmployees() {
        lock.readLock().lock();
        try { return new ArrayList<>(employees.values()); } finally { lock.readLock().unlock(); }
    }

    public Employee getEmployee(String id) {
        lock.readLock().lock();
        try { return employees.get(id); } finally { lock.readLock().unlock(); }
    }

    public void saveEmployee(Employee emp) {
        lock.writeLock().lock();
        try {
            if (emp.getId() == null || emp.getId().isEmpty()) {
                emp.setId("EMP-" + (100 + employees.size() + 1));
            }
            if (emp.getEmpCode() == null || emp.getEmpCode().isEmpty()) {
                emp.setEmpCode("ZOO-" + (100 + employees.size() + 1));
            }
            if (emp.getFullName() == null || emp.getFullName().isEmpty()) {
                emp.setFullName((emp.getFirstName() != null ? emp.getFirstName() : "") + 
                                (emp.getLastName() != null && !emp.getLastName().isEmpty() ? " " + emp.getLastName() : ""));
            }
            employees.put(emp.getId(), emp);

            User existing = getUserByEmployeeId(emp.getId());
            if (existing == null) {
                String username = (emp.getFirstName() + "." + (emp.getLastName() != null ? emp.getLastName() : "")).toLowerCase();
                User user = new User(
                    "USR-" + emp.getId(), username, "zoogle123", "EMPLOYEE", emp.getId(),
                    emp.getFullName(), emp.getEmail(), emp.getAvatar(), "ACTIVE"
                );
                users.put(user.getId(), user);
            } else {
                existing.setFullName(emp.getFullName());
                existing.setEmail(emp.getEmail());
                existing.setAvatar(emp.getAvatar());
            }

            updateDepartmentCounts();
            saveToFile();
        } finally {
            lock.writeLock().unlock();
        }
    }

    public boolean deleteEmployee(String id) {
        lock.writeLock().lock();
        try {
            Employee removed = employees.remove(id);
            if (removed != null) {
                users.entrySet().removeIf(e -> id.equals(e.getValue().getEmployeeId()));
                updateDepartmentCounts();
                saveToFile();
                return true;
            }
            return false;
        } finally {
            lock.writeLock().unlock();
        }
    }

    private void updateDepartmentCounts() {
        Map<String, Integer> counts = new HashMap<>();
        for (Employee e : employees.values()) {
            if (e.getDepartment() != null) {
                counts.put(e.getDepartment(), counts.getOrDefault(e.getDepartment(), 0) + 1);
            }
        }
        for (Department d : departments.values()) {
            d.setEmployeeCount(counts.getOrDefault(d.getName(), 0));
        }
    }

    public List<Department> getDepartments() {
        lock.readLock().lock();
        try {
            updateDepartmentCounts();
            return new ArrayList<>(departments.values());
        } finally {
            lock.readLock().unlock();
        }
    }

    public void saveDepartment(Department dept) {
        lock.writeLock().lock();
        try {
            if (dept.getId() == null || dept.getId().isEmpty()) {
                dept.setId("DEP-0" + (departments.size() + 1));
            }
            departments.put(dept.getId(), dept);
            saveToFile();
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Attendance> getAttendance(String employeeId) {
        lock.readLock().lock();
        try {
            List<Attendance> list = new ArrayList<>();
            for (Attendance a : attendance.values()) {
                if (employeeId == null || employeeId.isEmpty() || employeeId.equals(a.getEmployeeId())) {
                    list.add(a);
                }
            }
            list.sort((a, b) -> b.getDate().compareTo(a.getDate()));
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Attendance clockIn(String employeeId, String notes) {
        lock.writeLock().lock();
        try {
            Employee emp = employees.get(employeeId);
            String name = emp != null ? emp.getFullName() : "Employee";
            String todayStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String timeNow = java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

            for (Attendance a : attendance.values()) {
                if (todayStr.equals(a.getDate()) && employeeId.equals(a.getEmployeeId())) {
                    a.setNotes(notes != null && !notes.isEmpty() ? notes : a.getNotes());
                    saveToFile();
                    return a;
                }
            }

            String id = "ATT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Attendance att = new Attendance(id, employeeId, name, todayStr, timeNow, "", 0.0, "Present", notes != null ? notes : "Office QR Code Scanned");
            attendance.put(id, att);
            saveToFile();
            return att;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Attendance clockOut(String employeeId, String notes) {
        lock.writeLock().lock();
        try {
            String todayStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            String timeNow = java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("hh:mm a"));

            for (Attendance a : attendance.values()) {
                if (todayStr.equals(a.getDate()) && employeeId.equals(a.getEmployeeId())) {
                    a.setClockOut(timeNow);
                    a.setWorkHours(8.5);
                    if (notes != null && !notes.isEmpty()) a.setNotes(notes);
                    saveToFile();
                    return a;
                }
            }

            Employee emp = employees.get(employeeId);
            String name = emp != null ? emp.getFullName() : "Employee";
            String id = "ATT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Attendance att = new Attendance(id, employeeId, name, todayStr, "09:00 AM", timeNow, 8.0, "Present", notes != null ? notes : "Exit QR Code Scanned");
            attendance.put(id, att);
            saveToFile();
            return att;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<LeaveRequest> getLeaves(String employeeId) {
        lock.readLock().lock();
        try {
            List<LeaveRequest> list = new ArrayList<>();
            for (LeaveRequest l : leaves.values()) {
                if (employeeId == null || employeeId.isEmpty() || employeeId.equals(l.getEmployeeId())) {
                    list.add(l);
                }
            }
            list.sort((a, b) -> b.getAppliedAt().compareTo(a.getAppliedAt()));
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public LeaveRequest applyLeave(LeaveRequest req) {
        lock.writeLock().lock();
        try {
            if (req.getId() == null || req.getId().isEmpty()) {
                req.setId("LEV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            }
            Employee emp = employees.get(req.getEmployeeId());
            if (emp != null) {
                req.setEmpName(emp.getFullName());
            }
            req.setStatus("PENDING");
            req.setAppliedAt(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " " +
                java.time.LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
            leaves.put(req.getId(), req);
            saveToFile();
            return req;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public LeaveRequest updateLeaveStatus(String id, String status, String reviewedBy, String reviewComment) {
        lock.writeLock().lock();
        try {
            LeaveRequest req = leaves.get(id);
            if (req != null) {
                req.setStatus(status);
                req.setReviewedBy(reviewedBy);
                req.setReviewComment(reviewComment);
                saveToFile();
            }
            return req;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Payroll> getPayrolls(String employeeId) {
        lock.readLock().lock();
        try {
            List<Payroll> list = new ArrayList<>();
            for (Payroll p : payrolls.values()) {
                if (employeeId == null || employeeId.isEmpty() || employeeId.equals(p.getEmployeeId())) {
                    list.add(p);
                }
            }
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Payroll markPayrollPaid(String id) {
        lock.writeLock().lock();
        try {
            Payroll p = payrolls.get(id);
            if (p != null) {
                p.setStatus("PAID");
                p.setPaymentDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                saveToFile();
            }
            return p;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public void generateMonthlyPayroll(String monthYear) {
        lock.writeLock().lock();
        try {
            for (Employee emp : employees.values()) {
                boolean exists = false;
                for (Payroll p : payrolls.values()) {
                    if (p.getEmployeeId().equals(emp.getId()) && monthYear.equalsIgnoreCase(p.getMonthYear())) {
                        exists = true;
                        break;
                    }
                }
                if (!exists) {
                    double basic = Math.round(emp.getSalary() / 12.0);
                    double allowances = Math.round(basic * 0.25);
                    double tax = Math.round(basic * 0.12);
                    double deductions = Math.round(basic * 0.08);
                    double net = basic + allowances - tax - deductions;
                    String id = "PAY-" + (100 + payrolls.size() + 1);

                    Payroll p = new Payroll(
                        id, emp.getId(), emp.getFullName(), monthYear,
                        basic, allowances, deductions, tax, net, "PENDING", "-", "ZOO-SLIP-" + (200 + payrolls.size())
                    );
                    payrolls.put(id, p);
                }
            }
            saveToFile();
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<TaskItem> getTasks(String employeeId) {
        lock.readLock().lock();
        try {
            List<TaskItem> list = new ArrayList<>();
            for (TaskItem t : tasks.values()) {
                if (employeeId == null || employeeId.isEmpty() || employeeId.equals(t.getEmployeeId())) {
                    list.add(t);
                }
            }
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public TaskItem saveTask(TaskItem task) {
        lock.writeLock().lock();
        try {
            if (task.getId() == null || task.getId().isEmpty()) {
                task.setId("TSK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                task.setCreatedAt(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            }
            if (task.getStatus() == null || task.getStatus().isEmpty()) {
                task.setStatus("TO_DO");
            }
            if (task.getEmpName() == null || task.getEmpName().isEmpty()) {
                Employee emp = employees.get(task.getEmployeeId());
                if (emp != null) task.setEmpName(emp.getFullName());
            }
            tasks.put(task.getId(), task);
            saveToFile();
            return task;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public TaskItem updateTaskStatus(String id, String status) {
        lock.writeLock().lock();
        try {
            TaskItem t = tasks.get(id);
            if (t != null) {
                t.setStatus(status);
                saveToFile();
            }
            return t;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<Notice> getNotices() {
        lock.readLock().lock();
        try {
            List<Notice> list = new ArrayList<>(notices.values());
            list.sort((a, b) -> {
                if (a.isPinned() != b.isPinned()) {
                    return a.isPinned() ? -1 : 1;
                }
                return b.getCreatedAt().compareTo(a.getCreatedAt());
            });
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public Notice saveNotice(Notice n) {
        lock.writeLock().lock();
        try {
            if (n.getId() == null || n.getId().isEmpty()) {
                n.setId("NOT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                n.setCreatedAt(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            }
            notices.put(n.getId(), n);
            saveToFile();
            return n;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public boolean deleteNotice(String id) {
        lock.writeLock().lock();
        try {
            boolean removed = notices.remove(id) != null;
            if (removed) saveToFile();
            return removed;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public List<PerformanceReview> getReviews(String employeeId) {
        lock.readLock().lock();
        try {
            List<PerformanceReview> list = new ArrayList<>();
            for (PerformanceReview r : reviews.values()) {
                if (employeeId == null || employeeId.isEmpty() || employeeId.equals(r.getEmployeeId())) {
                    list.add(r);
                }
            }
            return list;
        } finally {
            lock.readLock().unlock();
        }
    }

    public PerformanceReview saveReview(PerformanceReview r) {
        lock.writeLock().lock();
        try {
            if (r.getId() == null || r.getId().isEmpty()) {
                r.setId("REV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                r.setDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            }
            Employee emp = employees.get(r.getEmployeeId());
            if (emp != null) r.setEmpName(emp.getFullName());
            reviews.put(r.getId(), r);
            saveToFile();
            return r;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Map<String, Object> getStats() {
        lock.readLock().lock();
        try {
            Map<String, Object> stats = new LinkedHashMap<>();
            int totalEmployees = employees.size();
            int presentToday = 0;
            String todayStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            for (Attendance a : attendance.values()) {
                if (todayStr.equals(a.getDate()) && ("Present".equalsIgnoreCase(a.getStatus()) || "Late".equalsIgnoreCase(a.getStatus()))) {
                    presentToday++;
                }
            }

            int pendingLeaves = 0;
            for (LeaveRequest l : leaves.values()) {
                if ("PENDING".equalsIgnoreCase(l.getStatus())) {
                    pendingLeaves++;
                }
            }

            double totalMonthlyPayroll = 0;
            for (Payroll p : payrolls.values()) {
                totalMonthlyPayroll += p.getNetSalary();
            }

            stats.put("totalEmployees", totalEmployees);
            stats.put("presentToday", presentToday);
            stats.put("attendanceRate", totalEmployees > 0 ? Math.round((presentToday * 100.0) / totalEmployees) : 0);
            stats.put("pendingLeaves", pendingLeaves);
            stats.put("totalMonthlyPayroll", Math.round(totalMonthlyPayroll));
            stats.put("totalDepartments", departments.size());
            stats.put("totalNotices", notices.size());

            Map<String, Integer> deptCounts = new LinkedHashMap<>();
            for (Employee e : employees.values()) {
                String d = e.getDepartment() != null ? e.getDepartment() : "Other";
                deptCounts.put(d, deptCounts.getOrDefault(d, 0) + 1);
            }
            stats.put("departmentDistribution", deptCounts);

            return stats;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void resetToDefaults() {
        lock.writeLock().lock();
        try {
            seedInitialData();
            saveToFile();
        } finally {
            lock.writeLock().unlock();
        }
    }
}
