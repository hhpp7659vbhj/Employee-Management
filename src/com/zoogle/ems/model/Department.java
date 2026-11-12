package com.zoogle.ems.model;

public class Department {
    private String id;
    private String code;
    private String name;
    private String description;
    private String headOfDept;
    private double budget;
    private String roomNumber;
    private int employeeCount;

    public Department() {}

    public Department(String id, String code, String name, String description, String headOfDept, double budget, String roomNumber, int employeeCount) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.description = description;
        this.headOfDept = headOfDept;
        this.budget = budget;
        this.roomNumber = roomNumber;
        this.employeeCount = employeeCount;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getHeadOfDept() { return headOfDept; }
    public void setHeadOfDept(String headOfDept) { this.headOfDept = headOfDept; }

    public double getBudget() { return budget; }
    public void setBudget(double budget) { this.budget = budget; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public int getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(int employeeCount) { this.employeeCount = employeeCount; }
}
