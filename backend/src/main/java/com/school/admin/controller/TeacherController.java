package com.school.admin.controller;

import com.school.admin.dto.request.EnterMarksRequest;
import com.school.admin.dto.request.MarkAttendanceRequest;
import com.school.admin.dto.request.ReplyComplaintRequest;
import com.school.admin.dto.request.UpdateMarksRequest;
import com.school.admin.dto.response.ComplaintResponse;
import com.school.admin.dto.response.ExamResponse;
import com.school.admin.dto.response.MarksResponse;
import com.school.admin.dto.response.MessageResponse;
import com.school.admin.dto.response.StudentResponse;
import com.school.admin.dto.response.TeacherAssignmentResponse;
import com.school.admin.entity.Attendance;
import com.school.admin.entity.Teacher;
import com.school.admin.service.AttendanceService;
import com.school.admin.service.ComplaintService;
import com.school.admin.service.ExamService;
import com.school.admin.service.MarksService;
import com.school.admin.service.StudentService;
import com.school.admin.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/teacher")
@PreAuthorize("hasRole('TEACHER')")
public class TeacherController {

    private final TeacherService teacherService;
    private final StudentService studentService;
    private final MarksService marksService;
    private final AttendanceService attendanceService;
    private final ExamService examService;
    private final ComplaintService complaintService;

    public TeacherController(TeacherService teacherService,
                              StudentService studentService,
                              MarksService marksService,
                              AttendanceService attendanceService,
                              ExamService examService,
                              ComplaintService complaintService) {
        this.teacherService = teacherService;
        this.studentService = studentService;
        this.marksService = marksService;
        this.attendanceService = attendanceService;
        this.examService = examService;
        this.complaintService = complaintService;
    }

    @GetMapping("/assignments")
    public ResponseEntity<List<TeacherAssignmentResponse>> getMyAssignments(
            @AuthenticationPrincipal UserDetails userDetails) {
        Teacher teacher = teacherService.getCurrentTeacher(userDetails.getUsername());
        return ResponseEntity.ok(teacherService.getTeacherAssignments(teacher.getId()));
    }

    @GetMapping("/students")
    public ResponseEntity<List<StudentResponse>> getStudents(
            @RequestParam Long classId,
            @RequestParam Long sectionId) {
        return ResponseEntity.ok(studentService.getAllStudents(classId, sectionId));
    }

    @PostMapping("/marks")
    public ResponseEntity<MarksResponse> enterMarks(
            @Valid @RequestBody EnterMarksRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(marksService.enterMarks(request, userDetails.getUsername()));
    }

    @PutMapping("/marks/{id}")
    public ResponseEntity<MarksResponse> updateMarks(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMarksRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(marksService.updateMarks(id, request, userDetails.getUsername()));
    }

    @GetMapping("/marks")
    public ResponseEntity<List<MarksResponse>> getMarks(
            @RequestParam Long examId,
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(marksService.getMarksByExamAndClass(examId, classId, sectionId, userDetails.getUsername()));
    }

    @PostMapping("/attendance")
    public ResponseEntity<MessageResponse> markAttendance(
            @Valid @RequestBody MarkAttendanceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(attendanceService.markAttendance(request, userDetails.getUsername()));
    }

    @GetMapping("/attendance")
    public ResponseEntity<List<?>> getAttendance(
            @RequestParam Long classId,
            @RequestParam Long sectionId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Attendance> records = attendanceService.getAttendanceByClassAndDate(classId, sectionId, date);
        // Map to a simple response format
        List<java.util.Map<String, Object>> result = records.stream().map(a -> {
            java.util.Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", a.getId());
            map.put("studentId", a.getStudent() != null ? a.getStudent().getId() : null);
            map.put("studentName", a.getStudent() != null ? a.getStudent().getFullName() : null);
            map.put("status", a.getStatus() != null ? a.getStatus().name() : null);
            map.put("attendanceDate", a.getAttendanceDate() != null ? a.getAttendanceDate().toString() : null);
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/exams")
    public ResponseEntity<List<ExamResponse>> getExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(complaintService.getComplaintsByTeacher(userDetails.getUsername()));
    }

    @PutMapping("/complaints/{id}/reply")
    public ResponseEntity<ComplaintResponse> replyToComplaint(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReplyComplaintRequest request) {
        return ResponseEntity.ok(complaintService.replyToComplaint(id, userDetails.getUsername(), request));
    }
}
