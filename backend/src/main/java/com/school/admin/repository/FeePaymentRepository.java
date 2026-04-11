package com.school.admin.repository;

import com.school.admin.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeePaymentRepository extends JpaRepository<FeePayment, Long> {
    List<FeePayment> findByStudentIdOrderByPaymentDateDesc(Long studentId);
    List<FeePayment> findByStudentIdAndAcademicYearOrderByPaymentDateDesc(Long studentId, String academicYear);

    @Query("SELECT COALESCE(SUM(fp.amount), 0) FROM FeePayment fp WHERE fp.student.id = :studentId AND fp.academicYear = :year")
    Double sumPaidByStudentAndYear(@Param("studentId") Long studentId, @Param("year") String year);

    @Query("SELECT COALESCE(SUM(fp.amount), 0) FROM FeePayment fp WHERE fp.academicYear = :year")
    Double sumTotalCollectedByYear(@Param("year") String year);
}
