package com.zoogle.ems.handler;

import com.zoogle.ems.db.Database;
import com.zoogle.ems.http.HttpRequest;
import com.zoogle.ems.http.HttpResponse;
import com.zoogle.ems.model.*;
import com.zoogle.ems.service.JsonUtil;

import java.util.*;

public class ApiHandler {
    private final Database db = Database.getInstance();

    public HttpResponse handle(HttpRequest request) {
        String path = request.getPath();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            return HttpResponse.noContent();
        }

        try {
            if (path.equals("/api/auth/login") && method.equals("POST")) {
                return handleLogin(request);
            } else if (path.equals("/api/stats") && method.equals("GET")) {
                return HttpResponse.json(200, JsonUtil.toJson(db.getStats()));
            } else if (path.equals("/api/employees") && method.equals("GET")) {
                return handleGetEmployees(request);
            } else if (path.equals("/api/employees") && method.equals("POST")) {
                return handleSaveEmployee(request);
            } else if (path.startsWith("/api/employees/") && method.equals("GET")) {
                return handleGetEmployeeById(path);
            } else if (path.startsWith("/api/employees/") && method.equals("PUT")) {
                return handleUpdateEmployee(request, path);
            } else if (path.startsWith("/api/employees/") && method.equals("DELETE")) {
                return handleDeleteEmployee(path);
            } else if (path.equals("/api/departments") && method.equals("GET")) {
                return HttpResponse.json(200, JsonUtil.toJson(db.getDepartments()));
            } else if (path.equals("/api/departments") && method.equals("POST")) {
                return handleSaveDepartment(request);
            } else if (path.equals("/api/attendance") && method.equals("GET")) {
                return handleGetAttendance(request);
            } else if (path.equals("/api/attendance/clock-in") && method.equals("POST")) {
                return handleClockIn(request);
            } else if (path.equals("/api/attendance/clock-out") && method.equals("POST")) {
                return handleClockOut(request);
            } else if (path.equals("/api/leaves") && method.equals("GET")) {
                return handleGetLeaves(request);
            } else if (path.equals("/api/leaves") && method.equals("POST")) {
                return handleApplyLeave(request);
            } else if (path.startsWith("/api/leaves/") && method.equals("PUT")) {
                return handleUpdateLeaveStatus(request, path);
            } else if (path.equals("/api/payroll") && method.equals("GET")) {
                return handleGetPayroll(request);
            } else if (path.equals("/api/payroll/generate") && method.equals("POST")) {
                return handleGeneratePayroll(request);
            } else if (path.startsWith("/api/payroll/") && path.endsWith("/pay") && method.equals("PUT")) {
                return handlePaySalary(path);
            } else if (path.equals("/api/tasks") && method.equals("GET")) {
                return handleGetTasks(request);
            } else if (path.equals("/api/tasks") && method.equals("POST")) {
                return handleSaveTask(request);
            } else if (path.startsWith("/api/tasks/") && method.equals("PUT")) {
                return handleUpdateTaskStatus(request, path);
            } else if (path.equals("/api/notices") && method.equals("GET")) {
                return HttpResponse.json(200, JsonUtil.toJson(db.getNotices()));
            } else if (path.equals("/api/notices") && method.equals("POST")) {
                return handleSaveNotice(request);
            } else if (path.startsWith("/api/notices/") && method.equals("DELETE")) {
                return handleDeleteNotice(path);
            } else if (path.equals("/api/performance") && method.equals("GET")) {
                return handleGetPerformance(request);
            } else if (path.equals("/api/performance") && method.equals("POST")) {
                return handleSavePerformance(request);
            } else if (path.equals("/api/reset") && method.equals("POST")) {
                db.resetToDefaults();
                return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "message", "Database successfully reset to default sample data")));
            } else {
                return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Endpoint not found: " + path)));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return HttpResponse.json(500, JsonUtil.toJson(Map.of("error", "Internal Server Error", "message", e.getMessage() != null ? e.getMessage() : "Unknown")));
        }
    }

    private HttpResponse handleLogin(HttpRequest request) {
        Map<String, Object> req = JsonUtil.parseObject(request.getBodyAsString());
        String username = (String) req.get("username");
        String password = (String) req.get("password");
        String role = (String) req.get("role");

        User user = db.authenticate(username, password, role);
        if (user != null) {
            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("token", "zoo_token_" + UUID.randomUUID());
            res.put("user", user);

            if (user.getEmployeeId() != null) {
                Employee emp = db.getEmployee(user.getEmployeeId());
                res.put("employee", emp);
            }
            return HttpResponse.json(200, JsonUtil.toJson(res));
        } else {
            return HttpResponse.json(401, JsonUtil.toJson(Map.of(
                "success", false,
                "message", "Invalid username or password for " + (role != null ? role.toLowerCase() : "user") + " portal."
            )));
        }
    }

    private HttpResponse handleGetEmployees(HttpRequest request) {
        List<Employee> list = db.getEmployees();
        String dept = request.getQueryParam("department");
        String search = request.getQueryParam("search");

        List<Employee> filtered = new ArrayList<>();
        for (Employee e : list) {
            boolean matchDept = dept == null || dept.isEmpty() || dept.equalsIgnoreCase("All") || dept.equalsIgnoreCase(e.getDepartment());
            boolean matchSearch = search == null || search.isEmpty() ||
                e.getFullName().toLowerCase().contains(search.toLowerCase()) ||
                (e.getEmpCode() != null && e.getEmpCode().toLowerCase().contains(search.toLowerCase())) ||
                (e.getDesignation() != null && e.getDesignation().toLowerCase().contains(search.toLowerCase()));
            if (matchDept && matchSearch) {
                filtered.add(e);
            }
        }
        return HttpResponse.json(200, JsonUtil.toJson(filtered));
    }

    private HttpResponse handleGetEmployeeById(String path) {
        String id = path.substring("/api/employees/".length());
        Employee emp = db.getEmployee(id);
        if (emp != null) {
            return HttpResponse.json(200, JsonUtil.toJson(emp));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Employee not found")));
        }
    }

    private HttpResponse handleSaveEmployee(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        Employee emp = mapToEmployee(m);
        db.saveEmployee(emp);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "employee", emp)));
    }

    private HttpResponse handleUpdateEmployee(HttpRequest request, String path) {
        String id = path.substring("/api/employees/".length());
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        Employee emp = mapToEmployee(m);
        emp.setId(id);
        db.saveEmployee(emp);
        return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "employee", emp)));
    }

    private HttpResponse handleDeleteEmployee(String path) {
        String id = path.substring("/api/employees/".length());
        boolean deleted = db.deleteEmployee(id);
        if (deleted) {
            return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "message", "Employee record deleted")));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Employee not found")));
        }
    }

    private HttpResponse handleSaveDepartment(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        Department dept = new Department(
            (String) m.get("id"), (String) m.get("code"), (String) m.get("name"),
            (String) m.get("description"), (String) m.get("headOfDept"),
            toDouble(m.get("budget")), (String) m.get("roomNumber"), 0
        );
        db.saveDepartment(dept);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "department", dept)));
    }

    private HttpResponse handleGetAttendance(HttpRequest request) {
        String empId = request.getQueryParam("employeeId");
        return HttpResponse.json(200, JsonUtil.toJson(db.getAttendance(empId)));
    }

    private HttpResponse handleClockIn(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        String empId = (String) m.get("employeeId");
        String notes = (String) m.get("notes");
        if (empId == null || empId.isEmpty()) {
            return HttpResponse.json(400, JsonUtil.toJson(Map.of("error", "employeeId is required")));
        }
        Attendance a = db.clockIn(empId, notes);
        return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "attendance", a)));
    }

    private HttpResponse handleClockOut(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        String empId = (String) m.get("employeeId");
        String notes = (String) m.get("notes");
        if (empId == null || empId.isEmpty()) {
            return HttpResponse.json(400, JsonUtil.toJson(Map.of("error", "employeeId is required")));
        }
        Attendance a = db.clockOut(empId, notes);
        return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "attendance", a)));
    }

    private HttpResponse handleGetLeaves(HttpRequest request) {
        String empId = request.getQueryParam("employeeId");
        return HttpResponse.json(200, JsonUtil.toJson(db.getLeaves(empId)));
    }

    private HttpResponse handleApplyLeave(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        LeaveRequest req = new LeaveRequest(
            null, (String) m.get("employeeId"), (String) m.get("empName"),
            (String) m.get("leaveType"), (String) m.get("startDate"), (String) m.get("endDate"),
            toInt(m.get("days")), (String) m.get("reason"), "PENDING", null, "", ""
        );
        db.applyLeave(req);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "leave", req)));
    }

    private HttpResponse handleUpdateLeaveStatus(HttpRequest request, String path) {
        String sub = path.substring("/api/leaves/".length());
        String id = sub.contains("/status") ? sub.substring(0, sub.indexOf("/status")) : sub;
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        String status = (String) m.get("status");
        String reviewedBy = (String) m.get("reviewedBy");
        String comment = (String) m.get("reviewComment");

        LeaveRequest req = db.updateLeaveStatus(id, status, reviewedBy, comment);
        if (req != null) {
            return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "leave", req)));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Leave request not found")));
        }
    }

    private HttpResponse handleGetPayroll(HttpRequest request) {
        String empId = request.getQueryParam("employeeId");
        return HttpResponse.json(200, JsonUtil.toJson(db.getPayrolls(empId)));
    }

    private HttpResponse handleGeneratePayroll(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        String month = (String) m.get("monthYear");
        if (month == null || month.isEmpty()) month = "Current Month";
        db.generateMonthlyPayroll(month);
        return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "message", "Payroll generated for " + month)));
    }

    private HttpResponse handlePaySalary(String path) {
        String sub = path.substring("/api/payroll/".length());
        String id = sub.substring(0, sub.indexOf("/pay"));
        Payroll p = db.markPayrollPaid(id);
        if (p != null) {
            return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "payroll", p)));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Payroll record not found")));
        }
    }

    private HttpResponse handleGetTasks(HttpRequest request) {
        String empId = request.getQueryParam("employeeId");
        return HttpResponse.json(200, JsonUtil.toJson(db.getTasks(empId)));
    }

    private HttpResponse handleSaveTask(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        TaskItem t = new TaskItem(
            (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
            (String) m.get("title"), (String) m.get("description"), (String) m.get("priority"),
            (String) m.get("dueDate"), (String) m.get("status"), null
        );
        db.saveTask(t);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "task", t)));
    }

    private HttpResponse handleUpdateTaskStatus(HttpRequest request, String path) {
        String id = path.substring("/api/tasks/".length());
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        String status = (String) m.get("status");
        TaskItem t = db.updateTaskStatus(id, status);
        if (t != null) {
            return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "task", t)));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Task not found")));
        }
    }

    private HttpResponse handleDeleteNotice(String path) {
        String id = path.substring("/api/notices/".length());
        boolean removed = db.deleteNotice(id);
        if (removed) {
            return HttpResponse.json(200, JsonUtil.toJson(Map.of("success", true, "message", "Notice deleted")));
        } else {
            return HttpResponse.json(404, JsonUtil.toJson(Map.of("error", "Notice not found")));
        }
    }

    private HttpResponse handleSaveNotice(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        Notice n = new Notice(
            (String) m.get("id"), (String) m.get("title"), (String) m.get("category"),
            (String) m.get("content"), (String) m.get("author"), null,
            Boolean.TRUE.equals(m.get("pinned"))
        );
        db.saveNotice(n);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "notice", n)));
    }

    private HttpResponse handleGetPerformance(HttpRequest request) {
        String empId = request.getQueryParam("employeeId");
        return HttpResponse.json(200, JsonUtil.toJson(db.getReviews(empId)));
    }

    private HttpResponse handleSavePerformance(HttpRequest request) {
        Map<String, Object> m = JsonUtil.parseObject(request.getBodyAsString());
        PerformanceReview r = new PerformanceReview(
            (String) m.get("id"), (String) m.get("employeeId"), (String) m.get("empName"),
            (String) m.get("reviewPeriod"), toInt(m.get("rating")),
            (String) m.get("goalsMet"), (String) m.get("feedback"),
            (String) m.get("reviewer"), null
        );
        db.saveReview(r);
        return HttpResponse.json(201, JsonUtil.toJson(Map.of("success", true, "review", r)));
    }

    private Employee mapToEmployee(Map<String, Object> m) {
        return new Employee(
            (String) m.get("id"), (String) m.get("empCode"), (String) m.get("firstName"),
            (String) m.get("lastName"), (String) m.get("email"), (String) m.get("phone"),
            (String) m.get("department"), (String) m.get("designation"),
            toDouble(m.get("salary")), (String) m.get("joiningDate"), (String) m.get("status"),
            (String) m.get("address"), (String) m.get("emergencyContact"), (String) m.get("avatar"),
            (String) m.get("bio"), (String) m.get("skills")
        );
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
}
