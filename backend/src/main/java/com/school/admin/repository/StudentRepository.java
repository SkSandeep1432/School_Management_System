package com.school.admin.repository;

import com.school.admin.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByClassesIdAndSectionId(Long classId, Long sectionId);

    Optional<Student> findByParentEmailIgnoreCase(String email);

    List<Student> findByClassesId(Long classId);

    boolean existsByRollNumber(String rollNumber);
}
