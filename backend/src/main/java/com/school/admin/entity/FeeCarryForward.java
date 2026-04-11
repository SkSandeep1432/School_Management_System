package com.school.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fee_carry_forwards")
public class FeeCarryForward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "from_academic_year", nullable = false)
    private String fromAcademicYear;

    @Column(name = "to_academic_year", nullable = false)
    private String toAcademicYear;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getFromAcademicYear() { return fromAcademicYear; }
    public void setFromAcademicYear(String fromAcademicYear) { this.fromAcademicYear = fromAcademicYear; }
    public String getToAcademicYear() { return toAcademicYear; }
    public void setToAcademicYear(String toAcademicYear) { this.toAcademicYear = toAcademicYear; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
