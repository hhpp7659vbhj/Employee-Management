package com.zoogle.ems.model;

public class TaskItem {
    private String id;
    private String employeeId;
    private String empName;
    private String title;
    private String description;
    private String priority; // "HIGH", "MEDIUM", "LOW"
    private String dueDate; // "YYYY-MM-DD"
    private String status; // "TO_DO", "IN_PROGRESS", "COMPLETED"
    private String createdAt;

    public TaskItem() {}

    public TaskItem(String id, String employeeId, String empName, String title, String description,
                    String priority, String dueDate, String status, String createdAt) {
        this.id = id;
        this.employeeId = employeeId;
        this.empName = empName;
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.dueDate = dueDate;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getDueDate() { return dueDate; }
    public void setDueDate(String dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
