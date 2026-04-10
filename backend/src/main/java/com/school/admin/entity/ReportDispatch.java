package com.school.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "report_dispatches")
public class ReportDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "sent_to_email", nullable = false)
    private String sentToEmail;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    private DispatchStatus status = DispatchStatus.SENT;

    public enum DispatchStatus { SENT, FAILED }

    public ReportDispatch() {}

    public ReportDispatch(Long id, Exam exam, Student student, String sentToEmail,
                          LocalDateTime sentAt, DispatchStatus status) {
        this.id = id;
        this.exam = exam;
        this.student = student;
        this.sentToEmail = sentToEmail;
        this.sentAt = sentAt;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getSentToEmail() { return sentToEmail; }
    public void setSentToEmail(String sentToEmail) { this.sentToEmail = sentToEmail; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public DispatchStatus getStatus() { return status; }
    public void setStatus(DispatchStatus status) { this.status = status; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Exam exam;
        private Student student;
        private String sentToEmail;
        private LocalDateTime sentAt;
        private DispatchStatus status = DispatchStatus.SENT;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder exam(Exam exam) { this.exam = exam; return this; }
        public Builder student(Student student) { this.student = student; return this; }
        public Builder sentToEmail(String sentToEmail) { this.sentToEmail = sentToEmail; return this; }
        public Builder sentAt(LocalDateTime sentAt) { this.sentAt = sentAt; return this; }
        public Builder status(DispatchStatus status) { this.status = status; return this; }

        public ReportDispatch build() {
            return new ReportDispatch(id, exam, student, sentToEmail, sentAt, status);
        }
    }
}
