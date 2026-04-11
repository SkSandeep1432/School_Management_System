package com.school.admin.repository;

import com.school.admin.entity.FeeCarryForward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FeeCarryForwardRepository extends JpaRepository<FeeCarryForward, Long> {

    List<FeeCarryForward> findByStudentIdAndToAcademicYear(Long studentId, String toAcademicYear);

    @Query("SELECT COALESCE(SUM(cf.amount), 0) FROM FeeCarryForward cf " +
           "WHERE cf.student.id = :studentId AND cf.toAcademicYear = :year")
    Double sumCarryForwardByStudentAndYear(@Param("studentId") Long studentId, @Param("year") String year);

    boolean existsByStudentIdAndFromAcademicYearAndToAcademicYear(
            Long studentId, String fromAcademicYear, String toAcademicYear);
}
