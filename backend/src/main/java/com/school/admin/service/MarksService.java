package com.school.admin.service;

import com.school.admin.dto.request.EnterMarksRequest;
import com.school.admin.dto.request.UpdateMarksRequest;
import com.school.admin.dto.response.AttendanceSummaryResponse;
import com.school.admin.dto.response.MarksResponse;
import com.school.admin.dto.response.ReportCardResponse;
import com.school.admin.entity.Exam;
import com.school.admin.entity.Mark;
import com.school.admin.entity.Student;
import com.school.admin.entity.Subject;
import com.school.admin.entity.Teacher;
import com.school.admin.entity.TeacherAssignment;
import com.school.admin.exception.BadRequestException;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.exception.UnauthorizedAccessException;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.MarksRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.SubjectRepository;
import com.school.admin.repository.TeacherAssignmentRepository;
import com.school.admin.util.GradeCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarksService {

    private final MarksRepository marksRepository;
    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherService teacherService;
    private final AttendanceService attendanceService;

    public MarksService(MarksRepository marksRepository,
                        ExamRepository examRepository,
                        StudentRepository studentRepository,
                        SubjectRepository subjectRepository,
                        TeacherAssignmentRepository teacherAssignmentRepository,
                        TeacherService teacherService,
                        AttendanceService attendanceService) {
        this.marksRepository = marksRepository;
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.subjectRepository = subjectRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherService = teacherService;
        this.attendanceService = attendanceService;
    }

    @Transactional
    public MarksResponse enterMarks(EnterMarksRequest request, String teacherUsername) {
        Teacher teacher = teacherService.getCurrentTeacher(teacherUsername);

        // Validate teacher is authorized for this subject/class/section
        if (!teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndClassesIdAndSectionId(
                teacher.getId(), request.subjectId(), request.classId(), request.sectionId())) {
            throw new UnauthorizedAccessException("You are not authorized to enter marks for this subject/class/section.");
        }

        // Check exam is not locked
        Exam exam = examRepository.findById(request.examId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + request.examId()));
        if (exam.isLocked()) {
            throw new BadRequestException("This exam is locked and no longer accepts mark entries.");
        }

        // Check for duplicate
        if (marksRepository.existsByStudentIdAndExamIdAndSubjectId(
                request.studentId(), request.examId(), request.subjectId())) {
            throw new BadRequestException("Marks for this student, exam, and subject have already been entered.");
        }

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.studentId()));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.subjectId()));

        BigDecimal maxMarks = request.maxMarks() != null ? request.maxMarks() : new BigDecimal("100");
        BigDecimal marksObtained = request.marksObtained();
        if (marksObtained.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Marks obtained cannot be negative.");
        }
        if (marksObtained.compareTo(maxMarks) > 0) {
            throw new BadRequestException("Marks obtained (" + marksObtained + ") cannot exceed max marks (" + maxMarks + ").");
        }
        double percentage = marksObtained.divide(maxMarks, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
        String grade = GradeCalculator.calculateGrade(percentage);

        Mark mark = Mark.builder()
                .student(student)
                .exam(exam)
                .subject(subject)
                .teacher(teacher)
                .marksObtained(marksObtained)
                .maxMarks(maxMarks)
                .grade(grade)
                .remarks(request.remarks())
                .build();

        return mapToResponse(marksRepository.save(mark));
    }

    @Transactional
    public MarksResponse updateMarks(Long markId, UpdateMarksRequest request, String teacherUsername) {
        Teacher teacher = teacherService.getCurrentTeacher(teacherUsername);

        Mark mark = marksRepository.findById(markId)
                .orElseThrow(() -> new ResourceNotFoundException("Mark not found with id: " + markId));

        // Validate mark belongs to teacher's subject
        if (!mark.getTeacher().getId().equals(teacher.getId())) {
            throw new UnauthorizedAccessException("You are not authorized to update this mark.");
        }

        // Check exam not locked
        if (mark.getExam().isLocked()) {
            throw new BadRequestException("This exam is locked and marks cannot be updated.");
        }

        BigDecimal maxMarks = mark.getMaxMarks();
        BigDecimal marksObtained = request.marksObtained();
        if (marksObtained.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Marks obtained cannot be negative.");
        }
        if (marksObtained.compareTo(maxMarks) > 0) {
            throw new BadRequestException("Marks obtained (" + marksObtained + ") cannot exceed max marks (" + maxMarks + ").");
        }
        double percentage = marksObtained.divide(maxMarks, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100")).doubleValue();
        String grade = GradeCalculator.calculateGrade(percentage);

        mark.setMarksObtained(marksObtained);
        mark.setGrade(grade);
        if (request.remarks() != null) {
            mark.setRemarks(request.remarks());
        }

        return mapToResponse(marksRepository.save(mark));
    }

    @Transactional(readOnly = true)
    public List<MarksResponse> getMarksByExamAndClass(Long examId, Long classId, Long sectionId, String teacherUsername) {
        Teacher teacher = teacherService.getCurrentTeacher(teacherUsername);

        // Get teacher's subject for this class/section assignment
        List<TeacherAssignment> assignments = teacherAssignmentRepository
                .findByTeacherIdAndClassesIdAndSectionId(teacher.getId(), classId, sectionId);

        if (assignments.isEmpty()) {
            throw new UnauthorizedAccessException("You have no assignment for this class/section.");
        }

        // Return marks for teacher's subjects only
        return assignments.stream()
                .flatMap(assignment -> marksRepository
                        .findByExamIdAndSubjectIdAndStudentClassesIdAndStudentSectionId(
                                examId, assignment.getSubject().getId(), classId, sectionId)
                        .stream())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReportCardResponse getStudentReportCard(Long studentId, Long examId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Mark> marks = marksRepository.findByStudentIdAndExamId(studentId, examId);
        List<MarksResponse> subjectMarks = marks.stream().map(this::mapToResponse).collect(Collectors.toList());

        BigDecimal totalObtained = marks.stream()
                .map(Mark::getMarksObtained)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal maxTotal = marks.stream()
                .map(Mark::getMaxMarks)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        double percentage = 0.0;
        String overallGrade = "F";
        if (maxTotal.compareTo(BigDecimal.ZERO) > 0) {
            percentage = totalObtained.divide(maxTotal, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
            overallGrade = GradeCalculator.calculateGrade(percentage);
        }

        AttendanceSummaryResponse attendanceSummary = attendanceService.getStudentAttendanceSummary(studentId);

        return new ReportCardResponse(
                student.getId(),
                student.getFullName(),
                student.getRollNumber(),
                student.getClasses() != null ? student.getClasses().getClassName() : null,
                student.getSection() != null ? student.getSection().getSectionName() : null,
                exam.getExamName(),
                exam.getAcademicYear(),
                subjectMarks,
                totalObtained.doubleValue(),
                maxTotal.doubleValue(),
                percentage,
                overallGrade,
                attendanceSummary
        );
    }

    @Transactional(readOnly = true)
    public List<MarksResponse> getAllMarksForExam(Long examId) {
        if (!examRepository.existsById(examId)) {
            throw new ResourceNotFoundException("Exam not found with id: " + examId);
        }
        return marksRepository.findByExamId(examId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public MarksResponse mapToResponse(Mark mark) {
        BigDecimal percentage = BigDecimal.ZERO;
        if (mark.getMaxMarks() != null && mark.getMaxMarks().compareTo(BigDecimal.ZERO) > 0
                && mark.getMarksObtained() != null) {
            percentage = mark.getMarksObtained()
                    .divide(mark.getMaxMarks(), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }
        return new MarksResponse(
                mark.getId(),
                mark.getStudent() != null ? mark.getStudent().getId() : null,
                mark.getStudent() != null ? mark.getStudent().getFullName() : null,
                mark.getExam() != null ? mark.getExam().getId() : null,
                mark.getExam() != null ? mark.getExam().getExamName() : null,
                mark.getSubject() != null ? mark.getSubject().getId() : null,
                mark.getSubject() != null ? mark.getSubject().getSubjectName() : null,
                mark.getMarksObtained(),
                mark.getMaxMarks(),
                mark.getGrade(),
                mark.getRemarks(),
                percentage.doubleValue()
        );
    }
}
