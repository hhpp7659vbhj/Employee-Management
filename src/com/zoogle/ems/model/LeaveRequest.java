package com.zoogle.ems.model;

public class LeaveRequest {
    private String id;
    private String employeeId;
    private String empName;
    private String leaveType; // "Casual", "Sick", "Annual", "Maternity"
    private String startDate; // "YYYY-MM-DD"
    private String endDate; // "YYYY-MM-DD"
    private int days;
    private String reason;
    private String status; // "PENDING", "APPROVED", "REJECTED"
    private String appliedAt; // "YYYY-MM-DD HH:mm"
    private String reviewedBy;
    private String reviewComment;

    public LeaveRequest() {}

    public LeaveRequest(String id, String employeeId, String empName, String leaveType, String startDate, String endDate,
                        int days, String reason, String status, String appliedAt, String reviewedBy, String reviewComment) {
        this.id = id;
        this.employeeId = employeeId;
        this.empName = empName;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.days = days;
        this.reason = reason;
        this.status = status;
        this.appliedAt = appliedAt;
        this.reviewedBy = reviewedBy;
        this.reviewComment = reviewComment;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getLeaveType() { return leaveType; }
    public void setLeaveType(String leaveType) { this.leaveType = leaveType; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public int getDays() { return days; }
    public void setDays(int days) { this.days = days; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAppliedAt() { return appliedAt; }
    public void setAppliedAt(String appliedAt) { this.appliedAt = appliedAt; }

    public String getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(String reviewedBy) { this.reviewedBy = reviewedBy; }

    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }
}
