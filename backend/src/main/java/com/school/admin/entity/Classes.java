package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "classes")
public class Classes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String className;

    public Classes() {}

    public Classes(Long id, String className) {
        this.id = id;
        this.className = className;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getClassName() { return className; }
    public void setClassName(String className) { this.className = className; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String className;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder className(String className) { this.className = className; return this; }

        public Classes build() {
            return new Classes(id, className);
        }
    }
}
