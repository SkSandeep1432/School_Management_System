package com.school.admin.repository;

import com.school.admin.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarksRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentIdAndExamId(Long studentId, Long examId);

    List<Mark> findByExamIdAndSubjectIdAndStudentClassesIdAndStudentSectionId(
            Long examId, Long subjectId, Long classId, Long sectionId);

    Optional<Mark> findByStudentIdAndExamIdAndSubjectId(Long studentId, Long examId, Long subjectId);

    boolean existsByStudentIdAndExamIdAndSubjectId(Long studentId, Long examId, Long subjectId);

    List<Mark> findByExamId(Long examId);

    int countByTeacherIdAndExamId(Long teacherId, Long examId);

    void deleteByExamId(Long examId);
}
