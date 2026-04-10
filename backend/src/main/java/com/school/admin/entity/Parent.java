package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "parents")
public class Parent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "full_name")
    private String fullName;

    public Parent() {}

    public Parent(Long id, User user, Student student, String fullName) {
        this.id = id;
        this.user = user;
        this.student = student;
        this.fullName = fullName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private User user;
        private Student student;
        private String fullName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder student(Student student) { this.student = student; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }

        public Parent build() {
            return new Parent(id, user, student, fullName);
        }
    }
}
