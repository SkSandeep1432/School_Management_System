package com.school.admin.repository;

import com.school.admin.entity.TeacherAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, Long> {

    List<TeacherAssignment> findByTeacherId(Long teacherId);

    List<TeacherAssignment> findByTeacherIdAndClassesIdAndSectionId(Long teacherId, Long classId, Long sectionId);

    boolean existsByTeacherIdAndSubjectIdAndClassesIdAndSectionId(Long teacherId, Long subjectId, Long classId, Long sectionId);

    List<TeacherAssignment> findByClassesIdAndSectionId(Long classId, Long sectionId);
}
