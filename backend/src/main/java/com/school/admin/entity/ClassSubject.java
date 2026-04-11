package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "class_subjects",
       uniqueConstraints = @UniqueConstraint(columnNames = {"class_id", "subject_id"}))
public class ClassSubject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Classes classes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    public ClassSubject() {}
    public ClassSubject(Classes classes, Subject subject) {
        this.classes = classes;
        this.subject = subject;
    }
    public Long getId() { return id; }
    public Classes getClasses() { return classes; }
    public Subject getSubject() { return subject; }
    public void setClasses(Classes classes) { this.classes = classes; }
    public void setSubject(Subject subject) { this.subject = subject; }
}
