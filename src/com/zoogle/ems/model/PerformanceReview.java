package com.zoogle.ems.model;

public class PerformanceReview {
    private String id;
    private String employeeId;
    private String empName;
    private String reviewPeriod; // "Q3 2026"
    private int rating; // 1-5
    private String goalsMet;
    private String feedback;
    private String reviewer;
    private String date;

    public PerformanceReview() {}

    public PerformanceReview(String id, String employeeId, String empName, String reviewPeriod, int rating, String goalsMet, String feedback, String reviewer, String date) {
        this.id = id;
        this.employeeId = employeeId;
        this.empName = empName;
        this.reviewPeriod = reviewPeriod;
        this.rating = rating;
        this.goalsMet = goalsMet;
        this.feedback = feedback;
        this.reviewer = reviewer;
        this.date = date;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getReviewPeriod() { return reviewPeriod; }
    public void setReviewPeriod(String reviewPeriod) { this.reviewPeriod = reviewPeriod; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getGoalsMet() { return goalsMet; }
    public void setGoalsMet(String goalsMet) { this.goalsMet = goalsMet; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getReviewer() { return reviewer; }
    public void setReviewer(String reviewer) { this.reviewer = reviewer; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
}
