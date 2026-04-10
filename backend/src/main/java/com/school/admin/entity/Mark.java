package com.school.admin.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "marks",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_student_exam_subject",
            columnNames = {"student_id", "exam_id", "subject_id"}
        )
    }
)
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "marks_obtained", precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(name = "max_marks", precision = 5, scale = 2)
    private BigDecimal maxMarks = new BigDecimal("100");

    private String grade;

    private String remarks;

    @Column(name = "entered_at")
    private LocalDateTime enteredAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Mark() {}

    public Mark(Long id, Student student, Exam exam, Subject subject, Teacher teacher,
                BigDecimal marksObtained, BigDecimal maxMarks, String grade, String remarks,
                LocalDateTime enteredAt, LocalDateTime updatedAt) {
        this.id = id;
        this.student = student;
        this.exam = exam;
        this.subject = subject;
        this.teacher = teacher;
        this.marksObtained = marksObtained;
        this.maxMarks = maxMarks;
        this.grade = grade;
        this.remarks = remarks;
        this.enteredAt = enteredAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        enteredAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public BigDecimal getMarksObtained() { return marksObtained; }
    public void setMarksObtained(BigDecimal marksObtained) { this.marksObtained = marksObtained; }

    public BigDecimal getMaxMarks() { return maxMarks; }
    public void setMaxMarks(BigDecimal maxMarks) { this.maxMarks = maxMarks; }

    public String getGrade() { return grade; }
    public void setGrade(String grade) { this.grade = grade; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getEnteredAt() { return enteredAt; }
    public void setEnteredAt(LocalDateTime enteredAt) { this.enteredAt = enteredAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Student student;
        private Exam exam;
        private Subject subject;
        private Teacher teacher;
        private BigDecimal marksObtained;
        private BigDecimal maxMarks = new BigDecimal("100");
        private String grade;
        private String remarks;
        private LocalDateTime enteredAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder student(Student student) { this.student = student; return this; }
        public Builder exam(Exam exam) { this.exam = exam; return this; }
        public Builder subject(Subject subject) { this.subject = subject; return this; }
        public Builder teacher(Teacher teacher) { this.teacher = teacher; return this; }
        public Builder marksObtained(BigDecimal marksObtained) { this.marksObtained = marksObtained; return this; }
        public Builder maxMarks(BigDecimal maxMarks) { this.maxMarks = maxMarks; return this; }
        public Builder grade(String grade) { this.grade = grade; return this; }
        public Builder remarks(String remarks) { this.remarks = remarks; return this; }
        public Builder enteredAt(LocalDateTime enteredAt) { this.enteredAt = enteredAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Mark build() {
            return new Mark(id, student, exam, subject, teacher, marksObtained, maxMarks, grade, remarks, enteredAt, updatedAt);
        }
    }
}
