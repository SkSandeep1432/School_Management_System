package com.school.admin.repository;

import com.school.admin.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByParentIdOrderByCreatedAtDesc(Long parentId);
    List<Complaint> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
}
