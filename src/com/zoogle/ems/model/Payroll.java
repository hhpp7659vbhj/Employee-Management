package com.zoogle.ems.model;

public class Payroll {
    private String id;
    private String employeeId;
    private String empName;
    private String monthYear; // "October 2026"
    private double basicSalary;
    private double allowances;
    private double deductions;
    private double tax;
    private double netSalary;
    private String status; // "PAID", "PENDING"
    private String paymentDate;
    private String slipNumber;

    public Payroll() {}

    public Payroll(String id, String employeeId, String empName, String monthYear, double basicSalary,
                   double allowances, double deductions, double tax, double netSalary, String status,
                   String paymentDate, String slipNumber) {
        this.id = id;
        this.employeeId = employeeId;
        this.empName = empName;
        this.monthYear = monthYear;
        this.basicSalary = basicSalary;
        this.allowances = allowances;
        this.deductions = deductions;
        this.tax = tax;
        this.netSalary = netSalary;
        this.status = status;
        this.paymentDate = paymentDate;
        this.slipNumber = slipNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getEmpName() { return empName; }
    public void setEmpName(String empName) { this.empName = empName; }

    public String getMonthYear() { return monthYear; }
    public void setMonthYear(String monthYear) { this.monthYear = monthYear; }

    public double getBasicSalary() { return basicSalary; }
    public void setBasicSalary(double basicSalary) { this.basicSalary = basicSalary; }

    public double getAllowances() { return allowances; }
    public void setAllowances(double allowances) { this.allowances = allowances; }

    public double getDeductions() { return deductions; }
    public void setDeductions(double deductions) { this.deductions = deductions; }

    public double getTax() { return tax; }
    public void setTax(double tax) { this.tax = tax; }

    public double getNetSalary() { return netSalary; }
    public void setNetSalary(double netSalary) { this.netSalary = netSalary; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentDate() { return paymentDate; }
    public void setPaymentDate(String paymentDate) { this.paymentDate = paymentDate; }

    public String getSlipNumber() { return slipNumber; }
    public void setSlipNumber(String slipNumber) { this.slipNumber = slipNumber; }
}
