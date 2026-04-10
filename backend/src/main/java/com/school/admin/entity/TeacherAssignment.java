package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "teacher_assignments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"teacher_id", "subject_id", "class_id", "section_id"}))
public class TeacherAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classes classes;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    public TeacherAssignment() {}

    public TeacherAssignment(Long id, Teacher teacher, Subject subject, Classes classes, Section section) {
        this.id = id;
        this.teacher = teacher;
        this.subject = subject;
        this.classes = classes;
        this.section = section;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Classes getClasses() { return classes; }
    public void setClasses(Classes classes) { this.classes = classes; }

    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Teacher teacher;
        private Subject subject;
        private Classes classes;
        private Section section;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder teacher(Teacher teacher) { this.teacher = teacher; return this; }
        public Builder subject(Subject subject) { this.subject = subject; return this; }
        public Builder classes(Classes classes) { this.classes = classes; return this; }
        public Builder section(Section section) { this.section = section; return this; }

        public TeacherAssignment build() {
            return new TeacherAssignment(id, teacher, subject, classes, section);
        }
    }
}
