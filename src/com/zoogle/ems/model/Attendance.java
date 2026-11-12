package com.zoogle.ems.model;

public class Attendance {
    private String id;
    private String employeeId;
    private String empName;
    private String date; // "YYYY-MM-DD"
    private String clockIn; // "HH:mm:ss" or "09:15 AM"
    private String clockOut; // "HH:mm:ss" or "05:45 PM"
    private double workHours;
    private String status; // "Present", "Late", "Half Day", "Absent"
    private String notes;

    public Attendance() {}

    public Attendance(String id, String employeeId, String empName, String date, String clockIn, String clockOut, double workHours, String status, String notes) {
        this.id = id;
        this.employeeId = employeeId;
        this.empName = empName;
        this.date = date;
        this.clockIn = clockIn;
        this.clockOut = clockOut;
        this.workHours = workHours;
        this.status = status;
        this.notes = notes;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getClockIn() { return clockIn; }
    public void setClockIn(String clockIn) { this.clockIn = clockIn; }

    public String getClockOut() { return clockOut; }
    public void setClockOut(String clockOut) { this.clockOut = clockOut; }

    public double getWorkHours() { return workHours; }
    public void setWorkHours(double workHours) { this.workHours = workHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
