package com.zoogle.ems.model;

public class User {
    private String id;
    private String username;
    private String password;
    private String role; // "ADMIN" or "EMPLOYEE"
    private String employeeId;
    private String fullName;
    private String email;
    private String avatar;
    private String status; // "ACTIVE", "INACTIVE"

    public User() {}

    public User(String id, String username, String password, String role, String employeeId, String fullName, String email, String avatar, String status) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
        this.employeeId = employeeId;
        this.fullName = fullName;
        this.email = email;
        this.avatar = avatar;
        this.status = status;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getFullName() {
        if (fullName != null && !fullName.isEmpty()) return fullName;
        if (username != null && !username.isEmpty()) return username;
        return "Zoogle User";
    }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
