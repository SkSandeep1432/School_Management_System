package com.school.admin.service;

import com.school.admin.dto.request.MarkAttendanceRequest;
import com.school.admin.dto.response.AttendanceSummaryResponse;
import com.school.admin.dto.response.MessageResponse;
import com.school.admin.entity.Attendance;
import com.school.admin.entity.Classes;
import com.school.admin.entity.Section;
import com.school.admin.entity.Student;
import com.school.admin.entity.Teacher;
import com.school.admin.entity.TeacherAssignment;
import com.school.admin.exception.BadRequestException;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.exception.UnauthorizedAccessException;
import com.school.admin.repository.AttendanceRepository;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.TeacherAssignmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ClassesRepository classesRepository;
    private final SectionRepository sectionRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherService teacherService;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             ClassesRepository classesRepository,
                             SectionRepository sectionRepository,
                             TeacherAssignmentRepository teacherAssignmentRepository,
                             TeacherService teacherService) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.classesRepository = classesRepository;
        this.sectionRepository = sectionRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherService = teacherService;
    }

    @Transactional
    public MessageResponse markAttendance(MarkAttendanceRequest request, String teacherUsername) {
        Teacher teacher = teacherService.getCurrentTeacher(teacherUsername);

        // Validate teacher is assigned to the class/section
        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByTeacherIdAndClassesIdAndSectionId(teacher.getId(), request.classId(), request.sectionId());
        if (assignments.isEmpty()) {
            throw new UnauthorizedAccessException("You are not assigned to this class/section.");
        }

        LocalDate date = LocalDate.parse(request.attendanceDate());

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.studentId()));

        Classes classes = classesRepository.findById(request.classId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.classId()));

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + request.sectionId()));

        Attendance.AttendanceStatus status;
        try {
            status = Attendance.AttendanceStatus.valueOf(request.status().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid attendance status: " + request.status() + ". Use PRESENT, ABSENT, or LATE.");
        }

        // Upsert: update if already exists, insert if new
        Attendance attendance = attendanceRepository
                .findByStudentIdAndAttendanceDate(request.studentId(), date)
                .orElseGet(() -> Attendance.builder()
                        .student(student)
                        .teacher(teacher)
                        .classes(classes)
                        .section(section)
                        .attendanceDate(date)
                        .build());

        attendance.setStatus(status);
        attendanceRepository.save(attendance);

        return new MessageResponse("Attendance marked successfully for student: " + student.getFullName());
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClassAndDate(Long classId, Long sectionId, LocalDate date) {
        return attendanceRepository.findByClassesIdAndSectionIdAndAttendanceDate(classId, sectionId, date);
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getStudentAttendanceSummary(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Attendance> allRecords = attendanceRepository.findByStudentId(studentId);
        long totalDays = allRecords.size();
        long presentDays = attendanceRepository.countByStudentIdAndStatus(studentId, Attendance.AttendanceStatus.PRESENT);
        long absentDays = attendanceRepository.countByStudentIdAndStatus(studentId, Attendance.AttendanceStatus.ABSENT);
        long lateDays = attendanceRepository.countByStudentIdAndStatus(studentId, Attendance.AttendanceStatus.LATE);

        double percentage = totalDays > 0
                ? ((double) (presentDays + lateDays) / totalDays) * 100.0
                : 0.0;

        return new AttendanceSummaryResponse(
                student.getId(),
                student.getFullName(),
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                Math.round(percentage * 100.0) / 100.0
        );
    }
}
