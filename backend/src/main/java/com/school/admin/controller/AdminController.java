package com.school.admin.controller;

import com.school.admin.dto.request.AssignTeacherRequest;
import com.school.admin.dto.request.CreateClassRequest;
import com.school.admin.dto.request.CreateExamRequest;
import com.school.admin.dto.request.CreateSectionRequest;
import com.school.admin.dto.request.CreateStudentRequest;
import com.school.admin.dto.request.CreateSubjectRequest;
import com.school.admin.dto.request.CreateTeacherRequest;
import com.school.admin.dto.request.PromoteRequest;
import com.school.admin.dto.request.ResetPasswordRequest;
import com.school.admin.dto.response.ClassResponse;
import com.school.admin.dto.response.ExamResponse;
import com.school.admin.dto.response.MessageResponse;
import com.school.admin.dto.response.PromoteResponse;
import com.school.admin.dto.response.SectionResponse;
import com.school.admin.dto.response.StudentResponse;
import com.school.admin.dto.response.SubjectResponse;
import com.school.admin.dto.response.TeacherAssignmentResponse;
import com.school.admin.dto.response.TeacherResponse;
import com.school.admin.entity.Attendance;
import com.school.admin.entity.Classes;
import com.school.admin.entity.ClassSubject;
import com.school.admin.entity.Section;
import com.school.admin.entity.Student;
import com.school.admin.entity.Subject;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.AttendanceRepository;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.ClassSubjectRepository;
import com.school.admin.repository.MarksRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.SubjectRepository;
import com.school.admin.repository.TeacherAssignmentRepository;
import java.time.LocalDate;
import com.school.admin.service.AnnouncementService;
import com.school.admin.service.ExamService;
import com.school.admin.service.ReportService;
import com.school.admin.service.StudentService;
import com.school.admin.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final StudentService studentService;
    private final TeacherService teacherService;
    private final ExamService examService;
    private final ReportService reportService;
    private final ClassesRepository classesRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final MarksRepository marksRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final StudentRepository studentRepository;
    private final AnnouncementService announcementService;
    private final ClassSubjectRepository classSubjectRepository;
    private final AttendanceRepository attendanceRepository;

    public AdminController(StudentService studentService,
                           TeacherService teacherService,
                           ExamService examService,
                           ReportService reportService,
                           ClassesRepository classesRepository,
                           SectionRepository sectionRepository,
                           SubjectRepository subjectRepository,
                           MarksRepository marksRepository,
                           TeacherAssignmentRepository teacherAssignmentRepository,
                           StudentRepository studentRepository,
                           AnnouncementService announcementService,
                           ClassSubjectRepository classSubjectRepository,
                           AttendanceRepository attendanceRepository) {
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.examService = examService;
        this.reportService = reportService;
        this.classesRepository = classesRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.marksRepository = marksRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.studentRepository = studentRepository;
        this.announcementService = announcementService;
        this.classSubjectRepository = classSubjectRepository;
        this.attendanceRepository = attendanceRepository;
    }

    // ===================== STUDENT ENDPOINTS =====================

    @PostMapping("/students")
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(studentService.createStudent(request));
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getAllStudents(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long sectionId) {
        return ResponseEntity.ok(studentService.getAllStudents(classId, sectionId));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<MessageResponse> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(new MessageResponse("Student deleted successfully."));
    }

    // ===================== TEACHER ENDPOINTS =====================

    @PostMapping("/teachers")
    public ResponseEntity<TeacherResponse> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        return ResponseEntity.ok(teacherService.createTeacher(request));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @GetMapping("/teachers/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacherById(id));
    }

    @PostMapping("/teachers/{id}/assign")
    public ResponseEntity<TeacherAssignmentResponse> assignTeacher(
            @PathVariable Long id,
            @Valid @RequestBody AssignTeacherRequest request) {
        return ResponseEntity.ok(teacherService.assignTeacher(id, request));
    }

    @GetMapping("/teachers/{id}/assignments")
    public ResponseEntity<List<TeacherAssignmentResponse>> getTeacherAssignments(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.getTeacherAssignments(id));
    }

    @DeleteMapping("/teachers/assignments/{assignmentId}")
    public ResponseEntity<MessageResponse> removeAssignment(@PathVariable Long assignmentId) {
        if (!teacherService.assignmentExists(assignmentId)) {
            throw new ResourceNotFoundException("Assignment not found with id: " + assignmentId);
        }
        teacherService.removeAssignment(assignmentId);
        return ResponseEntity.ok(new MessageResponse("Assignment removed successfully."));
    }

    @PutMapping("/teachers/{id}/reset-password")
    public ResponseEntity<MessageResponse> resetTeacherPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        teacherService.resetPassword(id, request.newPassword());
        return ResponseEntity.ok(new MessageResponse("Password reset successfully."));
    }

    @DeleteMapping("/teachers/{id}")
    public ResponseEntity<MessageResponse> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.ok(new MessageResponse("Teacher deleted successfully."));
    }

    // ===================== EXAM ENDPOINTS =====================

    @PostMapping("/exams")
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.ok(examService.createExam(request));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamResponse>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<ExamResponse> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PutMapping("/exams/{id}/lock")
    public ResponseEntity<ExamResponse> lockExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.lockExam(id));
    }

    @PutMapping("/exams/{id}/unlock")
    public ResponseEntity<ExamResponse> unlockExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.unlockExam(id));
    }

    @DeleteMapping("/exams/{id}")
    public ResponseEntity<MessageResponse> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(new MessageResponse("Exam deleted successfully."));
    }

    @GetMapping("/exams/{id}/marks-status")
    public ResponseEntity<Map<String, Object>> getMarksStatus(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getMarksStatus(id));
    }

    // ===================== REPORT ENDPOINTS =====================

    @PostMapping("/reports/send/{examId}")
    public ResponseEntity<MessageResponse> sendReports(@PathVariable Long examId) {
        MessageResponse response = reportService.generateAndSendReports(examId);
        return ResponseEntity.accepted().body(response);
    }

    // ===================== CLASSES ENDPOINTS =====================

    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        List<ClassResponse> classes = classesRepository.findAll().stream()
                .map(c -> new ClassResponse(c.getId(), c.getClassName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(classes);
    }

    @PostMapping("/classes")
    public ResponseEntity<ClassResponse> createClass(@Valid @RequestBody CreateClassRequest request) {
        Classes classes = Classes.builder()
                .className(request.className())
                .build();
        classes = classesRepository.save(classes);
        return ResponseEntity.ok(new ClassResponse(classes.getId(), classes.getClassName()));
    }

    // ===================== SECTIONS ENDPOINTS =====================

    @GetMapping("/sections")
    public ResponseEntity<List<SectionResponse>> getAllSections() {
        List<SectionResponse> sections = sectionRepository.findAll().stream()
                .map(s -> new SectionResponse(s.getId(), s.getSectionName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sections);
    }

    @PostMapping("/sections")
    public ResponseEntity<SectionResponse> createSection(@Valid @RequestBody CreateSectionRequest request) {
        Section section = Section.builder()
                .sectionName(request.sectionName())
                .build();
        section = sectionRepository.save(section);
        return ResponseEntity.ok(new SectionResponse(section.getId(), section.getSectionName()));
    }

    // ===================== SUBJECTS ENDPOINTS =====================

    @GetMapping("/subjects")
    public ResponseEntity<List<SubjectResponse>> getAllSubjects() {
        List<SubjectResponse> subjects = subjectRepository.findAll().stream()
                .map(s -> new SubjectResponse(s.getId(), s.getSubjectName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(subjects);
    }

    @PostMapping("/subjects")
    public ResponseEntity<SubjectResponse> createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        Subject subject = Subject.builder()
                .subjectName(request.subjectName())
                .build();
        subject = subjectRepository.save(subject);
        return ResponseEntity.ok(new SubjectResponse(subject.getId(), subject.getSubjectName()));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<MessageResponse> deleteSubject(@PathVariable Long id) {
        if (!subjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Subject not found with id: " + id);
        }
        subjectRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Subject deleted successfully."));
    }

    // ===================== ROLL NUMBER ENDPOINTS =====================

    @GetMapping("/students/next-roll-number")
    public ResponseEntity<Map<String, String>> getNextRollNumber(
            @RequestParam Long classId,
            @RequestParam Long sectionId) {
        Classes classes = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));
        Section section = sectionRepository.findById(sectionId)
                .orElseThrow(() -> new ResourceNotFoundException("Section not found: " + sectionId));

        long count = studentRepository.findByClassesIdAndSectionId(classId, sectionId).size();
        String nextRoll = classes.getClassName() + section.getSectionName() + String.format("%02d", count + 1);

        return ResponseEntity.ok(Map.of("rollNumber", nextRoll));
    }

    // ─── Year-End Promotion ───────────────────────────────────────────────────

    @GetMapping("/promote/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromoteResponse> previewPromotion(
            @RequestParam Long fromClassId,
            @RequestParam(required = false) Long toClassId) {
        return ResponseEntity.ok(studentService.previewPromotion(fromClassId, toClassId));
    }

    @PostMapping("/promote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PromoteResponse> promoteStudents(@Valid @RequestBody PromoteRequest request) {
        return ResponseEntity.ok(studentService.promoteStudents(request));
    }

    // ─── Teacher Progress ─────────────────────────────────────────────────────

    @GetMapping("/teacher-progress")
    public ResponseEntity<List<Map<String, Object>>> getTeacherProgress(
            @RequestParam Long examId) {
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        // Group assignments by teacher
        Map<Long, List<com.school.admin.entity.TeacherAssignment>> byTeacher = new java.util.LinkedHashMap<>();
        for (com.school.admin.entity.TeacherAssignment ta : teacherAssignmentRepository.findAll()) {
            byTeacher.computeIfAbsent(ta.getTeacher().getId(), k -> new java.util.ArrayList<>()).add(ta);
        }

        for (Map.Entry<Long, List<com.school.admin.entity.TeacherAssignment>> entry : byTeacher.entrySet()) {
            Long teacherId = entry.getKey();
            List<com.school.admin.entity.TeacherAssignment> tas = entry.getValue();
            String teacherName = tas.get(0).getTeacher().getFullName();

            // Count total students across all assigned class+section combos (de-duplicated)
            java.util.Set<Long> studentIds = new java.util.HashSet<>();
            for (com.school.admin.entity.TeacherAssignment ta : tas) {
                studentRepository.findByClassesIdAndSectionId(
                        ta.getClasses().getId(), ta.getSection().getId())
                        .forEach(s -> studentIds.add(s.getId()));
            }
            int totalStudents = studentIds.size();

            int marksEntered = marksRepository.countByTeacherIdAndExamId(teacherId, examId);
            int pending = Math.max(0, totalStudents - marksEntered);

            List<Map<String, Object>> subjectDetails = new java.util.ArrayList<>();
            for (com.school.admin.entity.TeacherAssignment ta : tas) {
                Map<String, Object> s = new java.util.HashMap<>();
                s.put("subjectName", ta.getSubject().getSubjectName());
                s.put("className", ta.getClasses().getClassName());
                s.put("sectionName", ta.getSection().getSectionName());
                List<com.school.admin.entity.Student> sectionStudents =
                        studentRepository.findByClassesIdAndSectionId(ta.getClasses().getId(), ta.getSection().getId());
                s.put("totalStudents", sectionStudents.size());
                subjectDetails.add(s);
            }

            Map<String, Object> row = new java.util.HashMap<>();
            row.put("teacherId", teacherId);
            row.put("teacherName", teacherName);
            row.put("totalStudents", totalStudents);
            row.put("marksEntered", marksEntered);
            row.put("pending", pending);
            row.put("subjects", subjectDetails);
            result.add(row);
        }

        return ResponseEntity.ok(result);
    }

    // ─── Announcements ───────────────────────────────────────────────────────────

    @PostMapping("/announcements/all")
    public ResponseEntity<MessageResponse> announceToAll(@RequestBody Map<String, String> body) {
        String subject = body.getOrDefault("subject", "Announcement");
        String message = body.getOrDefault("message", "");
        announcementService.sendToAll(subject, message);
        return ResponseEntity.ok(new MessageResponse("Announcement sent to all parents and teachers."));
    }

    @PostMapping("/announcements/teachers")
    public ResponseEntity<MessageResponse> announceToTeachers(@RequestBody Map<String, String> body) {
        String subject = body.getOrDefault("subject", "Announcement");
        String message = body.getOrDefault("message", "");
        announcementService.sendToTeachers(subject, message);
        return ResponseEntity.ok(new MessageResponse("Announcement sent to all teachers."));
    }

    // ===================== CLASS-SUBJECT MAPPING ENDPOINTS =====================

    @Transactional(readOnly = true)
    @GetMapping("/classes/{classId}/subjects")
    public ResponseEntity<List<Map<String, Object>>> getSubjectsForClass(@PathVariable Long classId) {
        List<ClassSubject> cs = classSubjectRepository.findByClassesId(classId);
        List<Map<String, Object>> result = cs.stream().map(c -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("classId", c.getClasses().getId());
            m.put("className", c.getClasses().getClassName());
            m.put("subjectId", c.getSubject().getId());
            m.put("subjectName", c.getSubject().getSubjectName());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @Transactional
    @PostMapping("/classes/{classId}/subjects")
    public ResponseEntity<Map<String, Object>> assignSubjectToClass(
            @PathVariable Long classId,
            @RequestBody Map<String, Long> body) {
        Long subjectId = body.get("subjectId");
        Classes cls = classesRepository.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classId));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + subjectId));
        if (classSubjectRepository.existsByClassesIdAndSubjectId(classId, subjectId)) {
            throw new com.school.admin.exception.BadRequestException("Subject already assigned to this class.");
        }
        ClassSubject cs = new ClassSubject(cls, subject);
        classSubjectRepository.save(cs);
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("id", cs.getId());
        m.put("classId", classId);
        m.put("className", cls.getClassName());
        m.put("subjectId", subjectId);
        m.put("subjectName", subject.getSubjectName());
        return ResponseEntity.ok(m);
    }

    @Transactional
    @DeleteMapping("/classes/{classId}/subjects/{subjectId}")
    public ResponseEntity<MessageResponse> removeSubjectFromClass(
            @PathVariable Long classId, @PathVariable Long subjectId) {
        classSubjectRepository.deleteByClassesIdAndSubjectId(classId, subjectId);
        return ResponseEntity.ok(new MessageResponse("Subject removed from class."));
    }

    // ===================== ADMIN ATTENDANCE ENDPOINTS =====================

    @GetMapping("/attendance")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceByClassAndDate(
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @RequestParam(required = false) String date) {
        LocalDate localDate = (date != null && !date.isBlank()) ? LocalDate.parse(date) : LocalDate.now();
        List<Attendance> records = attendanceRepository.findByClassesIdAndSectionIdAndAttendanceDate(classId, sectionId, localDate);
        List<Map<String, Object>> result = records.stream().map(a -> {
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("studentId", a.getStudent().getId());
            m.put("studentName", a.getStudent().getFullName());
            m.put("rollNumber", a.getStudent().getRollNumber());
            m.put("status", a.getStatus().name());
            m.put("attendanceDate", a.getAttendanceDate().toString());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/attendance/summary")
    public ResponseEntity<List<Map<String, Object>>> getAttendanceSummary(
            @RequestParam Long classId,
            @RequestParam Long sectionId) {
        List<Student> students = studentRepository.findByClassesIdAndSectionId(classId, sectionId);
        List<Map<String, Object>> result = students.stream().map(s -> {
            List<Attendance> records = attendanceRepository.findByStudentId(s.getId());
            long total = records.size();
            long present = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.PRESENT).count();
            long absent = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.ABSENT).count();
            long late = records.stream().filter(a -> a.getStatus() == Attendance.AttendanceStatus.LATE).count();
            double pct = total > 0 ? Math.round(((double)(present + late) / total) * 10000.0) / 100.0 : 0.0;
            Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("studentId", s.getId());
            m.put("studentName", s.getFullName());
            m.put("rollNumber", s.getRollNumber());
            m.put("totalDays", total);
            m.put("present", present);
            m.put("absent", absent);
            m.put("late", late);
            m.put("percentage", pct);
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
