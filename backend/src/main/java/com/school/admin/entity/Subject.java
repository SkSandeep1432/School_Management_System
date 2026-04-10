package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String subjectName;

    public Subject() {}

    public Subject(Long id, String subjectName) {
        this.id = id;
        this.subjectName = subjectName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String subjectName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder subjectName(String subjectName) { this.subjectName = subjectName; return this; }

        public Subject build() {
            return new Subject(id, subjectName);
        }
    }
}
