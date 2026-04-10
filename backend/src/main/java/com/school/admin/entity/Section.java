package com.school.admin.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sections")
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sectionName;

    public Section() {}

    public Section(Long id, String sectionName) {
        this.id = id;
        this.sectionName = sectionName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSectionName() { return sectionName; }
    public void setSectionName(String sectionName) { this.sectionName = sectionName; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String sectionName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder sectionName(String sectionName) { this.sectionName = sectionName; return this; }

        public Section build() {
            return new Section(id, sectionName);
        }
    }
}
