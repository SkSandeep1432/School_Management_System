package com.school.admin.service;

import com.school.admin.dto.response.AttendanceSummaryResponse;
import com.school.admin.dto.response.ExamResponse;
import com.school.admin.dto.response.StudentResponse;
import com.school.admin.entity.Parent;
import com.school.admin.entity.User;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParentService {

    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final ExamRepository examRepository;

    public ParentService(ParentRepository parentRepository,
                         UserRepository userRepository,
                         StudentService studentService,
                         AttendanceService attendanceService,
                         ExamRepository examRepository) {
        this.parentRepository = parentRepository;
        this.userRepository = userRepository;
        this.studentService = studentService;
        this.attendanceService = attendanceService;
        this.examRepository = examRepository;
    }

    @Transactional(readOnly = true)
    public StudentResponse getChildProfile(String parentUsername) {
        Parent parent = getParentByUsername(parentUsername);
        return studentService.mapToResponse(parent.getStudent());
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getChildReportCards(String parentUsername) {
        // Returns list of all available exams (parent can view any)
        return examRepository.findAll().stream()
                .map(exam -> new ExamResponse(
                        exam.getId(),
                        exam.getExamName(),
                        exam.getExamType() != null ? exam.getExamType().name() : null,
                        exam.getAcademicYear(),
                        exam.getStartDate() != null ? exam.getStartDate().toString() : null,
                        exam.getEndDate() != null ? exam.getEndDate().toString() : null,
                        exam.isLocked()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getChildAttendanceSummary(String parentUsername) {
        Parent parent = getParentByUsername(parentUsername);
        return attendanceService.getStudentAttendanceSummary(parent.getStudent().getId());
    }

    private Parent getParentByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found for user: " + username));
    }
}
