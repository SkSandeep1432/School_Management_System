package com.school.admin.service;

import com.school.admin.dto.request.CreateExamRequest;
import com.school.admin.dto.response.ExamResponse;
import com.school.admin.entity.Exam;
import com.school.admin.entity.Mark;
import com.school.admin.entity.Notification;
import com.school.admin.entity.Student;
import com.school.admin.entity.Teacher;
import com.school.admin.entity.TeacherAssignment;
import com.school.admin.exception.BadRequestException;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.MarksRepository;
import com.school.admin.repository.NotificationRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.TeacherAssignmentRepository;
import com.school.admin.repository.TeacherRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final AnnouncementService announcementService;
    private final TeacherRepository teacherRepository;
    private final NotificationRepository notificationRepository;

    public ExamService(ExamRepository examRepository,
                       MarksRepository marksRepository,
                       StudentRepository studentRepository,
                       TeacherAssignmentRepository teacherAssignmentRepository,
                       AnnouncementService announcementService,
                       TeacherRepository teacherRepository,
                       NotificationRepository notificationRepository) {
        this.examRepository = examRepository;
        this.marksRepository = marksRepository;
        this.studentRepository = studentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.announcementService = announcementService;
        this.teacherRepository = teacherRepository;
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public ExamResponse createExam(CreateExamRequest request) {
        Exam exam = Exam.builder()
                .examName(request.examName())
                .examType(Exam.ExamType.valueOf(request.examType()))
                .academicYear(request.academicYear())
                .startDate(request.startDate() != null ? LocalDate.parse(request.startDate()) : null)
                .endDate(request.endDate() != null ? LocalDate.parse(request.endDate()) : null)
                .isLocked(false)
                .build();
        return mapToResponse(examRepository.save(exam));
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getAllExams() {
        return examRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        return mapToResponse(exam);
    }

    @Transactional
    public ExamResponse lockExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        if (exam.isLocked()) {
            throw new BadRequestException("Exam is already locked.");
        }
        exam.setLocked(true);
        ExamResponse response = mapToResponse(examRepository.save(exam));

        // Build notification content
        String notifTitle = "📋 Exam Confirmed: " + exam.getExamName();
        String notifMessage = "The " + exam.getExamType().name() + " exam '" + exam.getExamName()
                + "' for Academic Year " + exam.getAcademicYear() + " has been confirmed by administration."
                + " Exam period: " + exam.getStartDate() + " to " + exam.getEndDate()
                + ". Mark entry is now closed.";

        // Send email to all teachers
        try {
            announcementService.sendToTeachers(
                "Exam Confirmed: " + exam.getExamName(),
                "Dear Teacher,\n\nThe exam '" + exam.getExamName() + "' ("
                + exam.getExamType().name() + ") for Academic Year " + exam.getAcademicYear()
                + " has been confirmed/locked by the School Administration.\n\n"
                + "Exam Period: " + exam.getStartDate() + " to " + exam.getEndDate() + "\n\n"
                + "Please note that mark entry for this exam is now closed.\n\n"
                + "Regards,\nSchool Administration"
            );
        } catch (Exception e) {
            // Log but don't fail the lock operation
            System.err.println("Failed to send exam lock email: " + e.getMessage());
        }

        // Create in-app notification for each teacher
        List<Teacher> teachers = teacherRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        for (Teacher teacher : teachers) {
            Notification notification = new Notification();
            notification.setTeacher(teacher);
            notification.setTitle(notifTitle);
            notification.setMessage(notifMessage);
            notification.setType("EXAM_LOCKED");
            notification.setRead(false);
            notification.setCreatedAt(now);
            notificationRepository.save(notification);
        }

        return response;
    }

    @Transactional
    public ExamResponse unlockExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        if (!exam.isLocked()) {
            throw new BadRequestException("Exam is already unlocked.");
        }
        exam.setLocked(false);
        return mapToResponse(examRepository.save(exam));
    }

    @Transactional
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + id));
        marksRepository.deleteByExamId(id);
        examRepository.delete(exam);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getMarksStatus(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Mark> allMarks = marksRepository.findByExamId(examId);

        // Group marks by subject
        Map<Long, List<Mark>> marksBySubject = new HashMap<>();
        for (Mark mark : allMarks) {
            Long subjectId = mark.getSubject().getId();
            marksBySubject.computeIfAbsent(subjectId, k -> new ArrayList<>()).add(mark);
        }

        // For each subject with marks, find total students in those classes
        List<Map<String, Object>> subjectStatuses = new ArrayList<>();
        for (Map.Entry<Long, List<Mark>> entry : marksBySubject.entrySet()) {
            Long subjectId = entry.getKey();
            List<Mark> subjectMarks = entry.getValue();

            String subjectName = subjectMarks.get(0).getSubject().getSubjectName();
            int studentsWithMarks = subjectMarks.size();

            // Count total students that should have marks for this subject
            // Using teacher assignments to find which classes/sections have this subject
            List<TeacherAssignment> assignments = teacherAssignmentRepository.findAll().stream()
                    .filter(a -> a.getSubject().getId().equals(subjectId))
                    .collect(Collectors.toList());

            int totalStudents = 0;
            for (TeacherAssignment assignment : assignments) {
                List<Student> students = studentRepository.findByClassesIdAndSectionId(
                        assignment.getClasses().getId(), assignment.getSection().getId());
                totalStudents += students.size();
            }

            Map<String, Object> status = new HashMap<>();
            status.put("subjectName", subjectName);
            status.put("studentsWithMarks", studentsWithMarks);
            status.put("totalStudents", totalStudents);
            status.put("complete", studentsWithMarks >= totalStudents && totalStudents > 0);
            subjectStatuses.add(status);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("examName", exam.getExamName());
        result.put("isLocked", exam.isLocked());
        result.put("subjectStatuses", subjectStatuses);
        return result;
    }

    public ExamResponse mapToResponse(Exam exam) {
        return new ExamResponse(
                exam.getId(),
                exam.getExamName(),
                exam.getExamType() != null ? exam.getExamType().name() : null,
                exam.getAcademicYear(),
                exam.getStartDate() != null ? exam.getStartDate().toString() : null,
                exam.getEndDate() != null ? exam.getEndDate().toString() : null,
                exam.isLocked()
        );
    }
}
