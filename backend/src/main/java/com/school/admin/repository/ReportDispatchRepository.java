package com.school.admin.repository;

import com.school.admin.entity.ReportDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportDispatchRepository extends JpaRepository<ReportDispatch, Long> {

    List<ReportDispatch> findByExamIdAndStudentId(Long examId, Long studentId);
}
