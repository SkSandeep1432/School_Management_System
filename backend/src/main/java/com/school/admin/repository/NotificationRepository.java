package com.school.admin.repository;

import com.school.admin.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    long countByTeacherIdAndIsReadFalse(Long teacherId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.teacher.id = :teacherId")
    void markAllReadByTeacherId(@Param("teacherId") Long teacherId);
}
