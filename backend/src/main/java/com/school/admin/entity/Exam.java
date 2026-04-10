package com.school.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "exam_name", nullable = false)
    private String examName;

    @Enumerated(EnumType.STRING)
    @Column(name = "exam_type", nullable = false)
    private ExamType examType;

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_locked", nullable = false)
    private boolean isLocked = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public enum ExamType { QUARTERLY, HALF_YEARLY, ANNUAL }

    public Exam() {}

    public Exam(Long id, String examName, ExamType examType, String academicYear,
                LocalDate startDate, LocalDate endDate, boolean isLocked, LocalDateTime createdAt) {
        this.id = id;
        this.examName = examName;
        this.examType = examType;
        this.academicYear = academicYear;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isLocked = isLocked;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getExamName() { return examName; }
    public void setExamName(String examName) { this.examName = examName; }

    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean isLocked) { this.isLocked = isLocked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String examName;
        private ExamType examType;
        private String academicYear;
        private LocalDate startDate;
        private LocalDate endDate;
        private boolean isLocked = false;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder examName(String examName) { this.examName = examName; return this; }
        public Builder examType(ExamType examType) { this.examType = examType; return this; }
        public Builder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public Builder isLocked(boolean isLocked) { this.isLocked = isLocked; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Exam build() {
            return new Exam(id, examName, examType, academicYear, startDate, endDate, isLocked, createdAt);
        }
    }
}
