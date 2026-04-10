package com.school.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance",
    uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "attendance_date"}))
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classes classes;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    public enum AttendanceStatus { PRESENT, ABSENT, LATE }

    public Attendance() {}

    public Attendance(Long id, Student student, Teacher teacher, Classes classes, Section section,
                      LocalDate attendanceDate, AttendanceStatus status) {
        this.id = id;
        this.student = student;
        this.teacher = teacher;
        this.classes = classes;
        this.section = section;
        this.attendanceDate = attendanceDate;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Classes getClasses() { return classes; }
    public void setClasses(Classes classes) { this.classes = classes; }

    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Student student;
        private Teacher teacher;
        private Classes classes;
        private Section section;
        private LocalDate attendanceDate;
        private AttendanceStatus status;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder student(Student student) { this.student = student; return this; }
        public Builder teacher(Teacher teacher) { this.teacher = teacher; return this; }
        public Builder classes(Classes classes) { this.classes = classes; return this; }
        public Builder section(Section section) { this.section = section; return this; }
        public Builder attendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; return this; }
        public Builder status(AttendanceStatus status) { this.status = status; return this; }

        public Attendance build() {
            return new Attendance(id, student, teacher, classes, section, attendanceDate, status);
        }
    }
}
