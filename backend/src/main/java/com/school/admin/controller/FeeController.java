package com.school.admin.controller;

import com.school.admin.dto.response.MessageResponse;
import com.school.admin.entity.Classes;
import com.school.admin.entity.FeePayment;
import com.school.admin.entity.FeeStructure;
import com.school.admin.entity.Student;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.FeePaymentRepository;
import com.school.admin.repository.FeeStructureRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.service.AnnouncementService;
import com.school.admin.service.ReceiptPdfService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/fee")
@PreAuthorize("hasRole('ADMIN')")
public class FeeController {

    private static final Logger logger = LoggerFactory.getLogger(FeeController.class);

    private final FeeStructureRepository feeStructureRepo;
    private final FeePaymentRepository feePaymentRepo;
    private final ClassesRepository classesRepo;
    private final StudentRepository studentRepo;
    private final ReceiptPdfService receiptPdfService;
    private final AnnouncementService announcementService;

    public FeeController(FeeStructureRepository feeStructureRepo,
                         FeePaymentRepository feePaymentRepo,
                         ClassesRepository classesRepo,
                         StudentRepository studentRepo,
                         ReceiptPdfService receiptPdfService,
                         AnnouncementService announcementService) {
        this.feeStructureRepo = feeStructureRepo;
        this.feePaymentRepo = feePaymentRepo;
        this.classesRepo = classesRepo;
        this.studentRepo = studentRepo;
        this.receiptPdfService = receiptPdfService;
        this.announcementService = announcementService;
    }

    // ── FEE STRUCTURE ──

    @Transactional(readOnly = true)
    @GetMapping("/structures")
    public ResponseEntity<List<Map<String, Object>>> getAllStructures(
            @RequestParam(required = false) String academicYear) {
        List<FeeStructure> list = (academicYear != null && !academicYear.isBlank())
                ? feeStructureRepo.findByAcademicYear(academicYear)
                : feeStructureRepo.findAll();
        return ResponseEntity.ok(list.stream().map(this::mapStructure).collect(Collectors.toList()));
    }

    @Transactional(readOnly = true)
    @GetMapping("/structures/class/{classId}")
    public ResponseEntity<List<Map<String, Object>>> getStructuresByClass(
            @PathVariable Long classId,
            @RequestParam(required = false) String academicYear) {
        List<FeeStructure> list = (academicYear != null && !academicYear.isBlank())
                ? feeStructureRepo.findByClassesIdAndAcademicYear(classId, academicYear)
                : feeStructureRepo.findByClassesId(classId);
        return ResponseEntity.ok(list.stream().map(this::mapStructure).collect(Collectors.toList()));
    }

    @Transactional
    @PostMapping("/structures")
    public ResponseEntity<Map<String, Object>> createStructure(@RequestBody Map<String, Object> body) {
        Long classId = Long.valueOf(body.get("classId").toString());
        Classes cls = classesRepo.findById(classId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
        FeeStructure fs = new FeeStructure();
        fs.setClasses(cls);
        fs.setFeeType(body.get("feeType").toString());
        fs.setAmount(Double.valueOf(body.get("amount").toString()));
        fs.setAcademicYear(body.get("academicYear").toString());
        fs.setDescription(body.containsKey("description") ? body.get("description").toString() : "");
        return ResponseEntity.ok(mapStructure(feeStructureRepo.save(fs)));
    }

    @Transactional
    @PutMapping("/structures/{id}")
    public ResponseEntity<Map<String, Object>> updateStructure(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        FeeStructure fs = feeStructureRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee structure not found"));
        if (body.containsKey("feeType")) fs.setFeeType(body.get("feeType").toString());
        if (body.containsKey("amount")) fs.setAmount(Double.valueOf(body.get("amount").toString()));
        if (body.containsKey("academicYear")) fs.setAcademicYear(body.get("academicYear").toString());
        if (body.containsKey("description")) fs.setDescription(body.get("description").toString());
        return ResponseEntity.ok(mapStructure(feeStructureRepo.save(fs)));
    }

    @Transactional
    @DeleteMapping("/structures/{id}")
    public ResponseEntity<MessageResponse> deleteStructure(@PathVariable Long id) {
        feeStructureRepo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Fee structure deleted."));
    }

    // ── FEE PAYMENTS ──

    @Transactional(readOnly = true)
    @GetMapping("/payments")
    public ResponseEntity<List<Map<String, Object>>> getPayments(
            @RequestParam(required = false) Long studentId) {
        List<FeePayment> list = (studentId != null)
                ? feePaymentRepo.findByStudentIdOrderByPaymentDateDesc(studentId)
                : feePaymentRepo.findAll();
        return ResponseEntity.ok(list.stream().map(this::mapPayment).collect(Collectors.toList()));
    }

    @Transactional
    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> recordPayment(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        FeePayment fp = new FeePayment();
        fp.setStudent(student);
        fp.setAmount(Double.valueOf(body.get("amount").toString()));
        fp.setPaymentDate(LocalDate.parse(body.get("paymentDate").toString()));
        fp.setPaymentMode(body.get("paymentMode").toString());
        fp.setAcademicYear(body.get("academicYear").toString());
        fp.setNotes(body.containsKey("notes") ? body.get("notes").toString() : "");
        // Generate receipt number
        String receipt = "RCP-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + String.format("%05d", (long)(Math.random() * 90000) + 10000);
        fp.setReceiptNumber(receipt);
        FeePayment saved = feePaymentRepo.save(fp);
        Map<String, Object> paymentData = mapPayment(saved);

        // Send PDF receipt email to parent (async - don't fail if email fails)
        String parentEmail = student.getParentEmail();
        if (parentEmail != null && !parentEmail.isBlank()) {
            try {
                String className   = student.getClasses() != null ? student.getClasses().getClassName() : "";
                String sectionName = student.getSection() != null ? student.getSection().getSectionName() : "";
                byte[] pdfBytes = receiptPdfService.generateReceiptPdf(
                        paymentData, student.getFullName(), student.getRollNumber(), className, sectionName);
                announcementService.sendReceiptEmail(
                        parentEmail, student.getFullName(), receipt, paymentData, pdfBytes);
            } catch (Exception e) {
                logger.warn("Could not send receipt email for {}: {}", receipt, e.getMessage());
            }
        }

        return ResponseEntity.ok(paymentData);
    }

    @Transactional
    @DeleteMapping("/payments/{id}")
    public ResponseEntity<MessageResponse> deletePayment(@PathVariable Long id) {
        feePaymentRepo.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Payment deleted."));
    }

    // ── STUDENT FEE SUMMARY ──

    @Transactional(readOnly = true)
    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudentsSummary(
            @RequestParam(required = false) String academicYear) {
        String year = (academicYear != null && !academicYear.isBlank()) ? academicYear : getCurrentYear();
        List<Student> students = studentRepo.findAll();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Student s : students) {
            result.add(buildStudentSummary(s, year));
        }
        return ResponseEntity.ok(result);
    }

    @Transactional(readOnly = true)
    @GetMapping("/students/{studentId}")
    public ResponseEntity<Map<String, Object>> getStudentDetail(
            @PathVariable Long studentId,
            @RequestParam(required = false) String academicYear) {
        String year = (academicYear != null && !academicYear.isBlank()) ? academicYear : getCurrentYear();
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        Map<String, Object> summary = buildStudentSummary(student, year);
        // Add payment history
        List<FeePayment> payments = feePaymentRepo.findByStudentIdAndAcademicYearOrderByPaymentDateDesc(studentId, year);
        summary.put("paymentHistory", payments.stream().map(this::mapPayment).collect(Collectors.toList()));
        // Add fee structure breakdown
        Long classId = student.getClasses() != null ? student.getClasses().getId() : null;
        if (classId != null) {
            List<FeeStructure> structures = feeStructureRepo.findByClassesIdAndAcademicYear(classId, year);
            summary.put("feeStructures", structures.stream().map(this::mapStructure).collect(Collectors.toList()));
        }
        return ResponseEntity.ok(summary);
    }

    // ── HELPERS ──

    private Map<String, Object> buildStudentSummary(Student s, String year) {
        Long classId = s.getClasses() != null ? s.getClasses().getId() : null;
        double totalDue = 0;
        if (classId != null) {
            List<FeeStructure> structures = feeStructureRepo.findByClassesIdAndAcademicYear(classId, year);
            totalDue = structures.stream().mapToDouble(FeeStructure::getAmount).sum();
        }
        Double totalPaid = feePaymentRepo.sumPaidByStudentAndYear(s.getId(), year);
        if (totalPaid == null) totalPaid = 0.0;
        double balance = totalDue - totalPaid;
        String status = totalDue == 0 ? "NO_STRUCTURE" : (balance <= 0 ? "PAID" : (totalPaid > 0 ? "PARTIAL" : "UNPAID"));

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("studentId", s.getId());
        m.put("fullName", s.getFullName());
        m.put("rollNumber", s.getRollNumber());
        m.put("className", s.getClasses() != null ? s.getClasses().getClassName() : "");
        m.put("sectionName", s.getSection() != null ? s.getSection().getSectionName() : "");
        m.put("parentEmail", s.getParentEmail());
        m.put("totalDue", totalDue);
        m.put("totalPaid", totalPaid);
        m.put("balance", Math.max(0, balance));
        m.put("status", status);
        m.put("academicYear", year);
        return m;
    }

    private Map<String, Object> mapStructure(FeeStructure fs) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", fs.getId());
        m.put("classId", fs.getClasses().getId());
        m.put("className", fs.getClasses().getClassName());
        m.put("feeType", fs.getFeeType());
        m.put("amount", fs.getAmount());
        m.put("academicYear", fs.getAcademicYear());
        m.put("description", fs.getDescription());
        return m;
    }

    private Map<String, Object> mapPayment(FeePayment fp) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", fp.getId());
        m.put("studentId", fp.getStudent().getId());
        m.put("studentName", fp.getStudent().getFullName());
        m.put("rollNumber", fp.getStudent().getRollNumber());
        m.put("className", fp.getStudent().getClasses() != null ? fp.getStudent().getClasses().getClassName() : "");
        m.put("amount", fp.getAmount());
        m.put("paymentDate", fp.getPaymentDate() != null ? fp.getPaymentDate().toString() : null);
        m.put("paymentMode", fp.getPaymentMode());
        m.put("receiptNumber", fp.getReceiptNumber());
        m.put("academicYear", fp.getAcademicYear());
        m.put("notes", fp.getNotes());
        m.put("createdAt", fp.getCreatedAt() != null ? fp.getCreatedAt().toString() : null);
        return m;
    }

    private String getCurrentYear() {
        int y = LocalDate.now().getYear();
        return y + "-" + String.valueOf(y + 1).substring(2);
    }
}
