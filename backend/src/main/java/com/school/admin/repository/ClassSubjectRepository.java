package com.school.admin.repository;

import com.school.admin.entity.ClassSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassSubjectRepository extends JpaRepository<ClassSubject, Long> {
    List<ClassSubject> findByClassesId(Long classId);
    boolean existsByClassesIdAndSubjectId(Long classId, Long subjectId);
    void deleteByClassesIdAndSubjectId(Long classId, Long subjectId);
}
