package com.school.admin.controller;

import com.school.admin.dto.request.CreateComplaintRequest;
import com.school.admin.dto.response.AttendanceSummaryResponse;
import com.school.admin.dto.response.ComplaintResponse;
import com.school.admin.dto.response.ExamResponse;
import com.school.admin.dto.response.ReportCardResponse;
import com.school.admin.dto.response.StudentResponse;
import com.school.admin.dto.response.TeacherResponse;
import com.school.admin.service.TeacherService;
import com.school.admin.entity.Parent;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.UserRepository;
import com.school.admin.entity.User;
import com.school.admin.service.ComplaintService;
import com.school.admin.service.MarksService;
import com.school.admin.service.ParentService;
import com.school.admin.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")
public class ParentController {

    private final ParentService parentService;
    private final MarksService marksService;
    private final ReportService reportService;
    private final ParentRepository parentRepository;
    private final UserRepository userRepository;
    private final ComplaintService complaintService;
    private final TeacherService teacherService;

    public ParentController(ParentService parentService,
                            MarksService marksService,
                            ReportService reportService,
                            ParentRepository parentRepository,
                            UserRepository userRepository,
                            ComplaintService complaintService,
                            TeacherService teacherService) {
        this.parentService = parentService;
        this.marksService = marksService;
        this.reportService = reportService;
        this.parentRepository = parentRepository;
        this.userRepository = userRepository;
        this.complaintService = complaintService;
        this.teacherService = teacherService;
    }

    @GetMapping("/child")
    public ResponseEntity<StudentResponse> getChildProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(parentService.getChildProfile(userDetails.getUsername()));
    }

    @GetMapping("/child/reports")
    public ResponseEntity<List<ExamResponse>> getChildReportCards(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(parentService.getChildReportCards(userDetails.getUsername()));
    }

    @GetMapping("/child/reports/{examId}")
    public ResponseEntity<ReportCardResponse> getChildReportCard(
            @PathVariable Long examId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = getStudentIdForParent(userDetails.getUsername());
        return ResponseEntity.ok(marksService.getStudentReportCard(studentId, examId));
    }

    @GetMapping("/child/reports/{examId}/pdf")
    public ResponseEntity<byte[]> getChildReportCardPdf(
            @PathVariable Long examId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long studentId = getStudentIdForParent(userDetails.getUsername());
        byte[] pdfBytes = reportService.generateReportPdf(studentId, examId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_card.pdf\"")
                .body(pdfBytes);
    }

    @GetMapping("/child/attendance")
    public ResponseEntity<AttendanceSummaryResponse> getChildAttendanceSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(parentService.getChildAttendanceSummary(userDetails.getUsername()));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<TeacherResponse>> getTeachers() {
        return ResponseEntity.ok(teacherService.getAllTeachers());
    }

    @PostMapping("/complaints")
    public ResponseEntity<ComplaintResponse> createComplaint(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateComplaintRequest request) {
        return ResponseEntity.ok(complaintService.createComplaint(userDetails.getUsername(), request));
    }

    @GetMapping("/complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(complaintService.getComplaintsByParent(userDetails.getUsername()));
    }

    private Long getStudentIdForParent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Parent parent = parentRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent profile not found for user: " + username));
        return parent.getStudent().getId();
    }
}
