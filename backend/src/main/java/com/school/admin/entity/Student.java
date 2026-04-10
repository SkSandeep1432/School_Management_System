package com.school.admin.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "roll_number", nullable = false, unique = true)
    private String rollNumber;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = false)
    private Classes classes;

    @ManyToOne
    @JoinColumn(name = "section_id", nullable = false)
    private Section section;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "parent_email")
    private String parentEmail;

    private String phone;

    private String address;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Student() {}

    public Student(Long id, String fullName, String rollNumber, Classes classes, Section section,
                   LocalDate dateOfBirth, String parentEmail, String phone, String address,
                   LocalDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.rollNumber = rollNumber;
        this.classes = classes;
        this.section = section;
        this.dateOfBirth = dateOfBirth;
        this.parentEmail = parentEmail;
        this.phone = phone;
        this.address = address;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Classes getClasses() { return classes; }
    public void setClasses(Classes classes) { this.classes = classes; }

    public Section getSection() { return section; }
    public void setSection(Section section) { this.section = section; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getParentEmail() { return parentEmail; }
    public void setParentEmail(String parentEmail) { this.parentEmail = parentEmail; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String fullName;
        private String rollNumber;
        private Classes classes;
        private Section section;
        private LocalDate dateOfBirth;
        private String parentEmail;
        private String phone;
        private String address;
        private LocalDateTime createdAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public Builder classes(Classes classes) { this.classes = classes; return this; }
        public Builder section(Section section) { this.section = section; return this; }
        public Builder dateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; return this; }
        public Builder parentEmail(String parentEmail) { this.parentEmail = parentEmail; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder address(String address) { this.address = address; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Student build() {
            return new Student(id, fullName, rollNumber, classes, section, dateOfBirth, parentEmail, phone, address, createdAt);
        }
    }
}
