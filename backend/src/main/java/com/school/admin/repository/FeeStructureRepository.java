package com.school.admin.repository;

import com.school.admin.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, Long> {
    List<FeeStructure> findByClassesId(Long classId);
    List<FeeStructure> findByAcademicYear(String academicYear);
    List<FeeStructure> findByClassesIdAndAcademicYear(Long classId, String academicYear);
    void deleteByClassesId(Long classId);
}
