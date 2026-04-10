package com.school.admin.repository;

import com.school.admin.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByClassesIdAndSectionIdAndAttendanceDate(Long classId, Long sectionId, LocalDate date);

    Optional<Attendance> findByStudentIdAndAttendanceDate(Long studentId, LocalDate date);

    long countByStudentIdAndStatus(Long studentId, Attendance.AttendanceStatus status);
}
