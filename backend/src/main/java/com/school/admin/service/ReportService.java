package com.school.admin.service;

import com.school.admin.dto.response.MessageResponse;
import com.school.admin.dto.response.ReportCardResponse;
import com.school.admin.entity.Exam;
import com.school.admin.entity.Mark;
import com.school.admin.entity.ReportDispatch;
import com.school.admin.entity.Student;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.MarksRepository;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.ReportDispatchRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.util.PdfReportGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    private final ExamRepository examRepository;
    private final MarksRepository marksRepository;
    private final MarksService marksService;
    private final PdfReportGenerator pdfReportGenerator;
    private final ReportDispatchRepository reportDispatchRepository;
    private final ParentRepository parentRepository;
    private final StudentRepository studentRepository;
    private final JavaMailSender mailSender;

    public ReportService(ExamRepository examRepository,
                         MarksRepository marksRepository,
                         MarksService marksService,
                         PdfReportGenerator pdfReportGenerator,
                         ReportDispatchRepository reportDispatchRepository,
                         ParentRepository parentRepository,
                         StudentRepository studentRepository,
                         JavaMailSender mailSender) {
        this.examRepository = examRepository;
        this.marksRepository = marksRepository;
        this.marksService = marksService;
        this.pdfReportGenerator = pdfReportGenerator;
        this.reportDispatchRepository = reportDispatchRepository;
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.mailSender = mailSender;
    }

    /**
     * Returns immediately and dispatches one async task per student.
     * No long-running transaction — DB lock is released instantly.
     */
    @Transactional(readOnly = true)
    public MessageResponse generateAndSendReports(Long examId) {
        examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id: " + examId));

        List<Mark> allMarks = marksRepository.findByExamId(examId);

        Set<Long> studentIds = allMarks.stream()
                .map(m -> m.getStudent().getId())
                .collect(Collectors.toSet());

        if (studentIds.isEmpty()) {
            return new MessageResponse("No students with marks found for this exam.");
        }

        for (Long studentId : studentIds) {
            processStudentAsync(examId, studentId);
        }

        return new MessageResponse("Report generation started for " + studentIds.size()
                + " students. Emails will be sent in the background.");
    }

    /**
     * Processes a single student in its own thread and short transaction.
     * Failures for one student don't affect others.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processStudentAsync(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId).orElse(null);
        Student student = studentRepository.findById(studentId).orElse(null);
        if (exam == null || student == null) return;

        ReportDispatch.DispatchStatus dispatchStatus = ReportDispatch.DispatchStatus.SENT;
        try {
            ReportCardResponse reportCard = marksService.getStudentReportCard(studentId, examId);
            byte[] pdfBytes = pdfReportGenerator.generateReportCard(reportCard);

            String recipientEmail = parentRepository.findByStudentId(studentId)
                    .map(p -> p.getUser().getEmail())
                    .filter(e -> e != null && !e.isBlank())
                    .orElse(student.getParentEmail());

            if (recipientEmail != null && !recipientEmail.isBlank()) {
                sendReportEmail(recipientEmail, student.getFullName(), exam.getExamName(), pdfBytes);
                logger.info("Report sent for student: {}", student.getFullName());
            } else {
                logger.warn("No parent email for student: {}", student.getFullName());
                dispatchStatus = ReportDispatch.DispatchStatus.FAILED;
            }
        } catch (Exception e) {
            logger.error("Failed to generate/send report for student {}: {}", student.getFullName(), e.getMessage());
            dispatchStatus = ReportDispatch.DispatchStatus.FAILED;
        }

        ReportDispatch dispatch = ReportDispatch.builder()
                .exam(exam)
                .student(student)
                .sentToEmail(student.getParentEmail() != null ? student.getParentEmail() : "N/A")
                .status(dispatchStatus)
                .build();
        reportDispatchRepository.save(dispatch);
    }

    public byte[] generateReportPdf(Long studentId, Long examId) {
        ReportCardResponse reportCard = marksService.getStudentReportCard(studentId, examId);
        return pdfReportGenerator.generateReportCard(reportCard);
    }

    private void sendReportEmail(String to, String studentName, String examName, byte[] pdfBytes) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Report Card - " + examName + " for " + studentName);
        helper.setText("Dear Parent,\n\nPlease find attached the report card for " + studentName
                + " for " + examName + ".\n\nRegards,\nSchool Administration");
        helper.addAttachment(studentName + "_" + examName + "_ReportCard.pdf",
                new org.springframework.core.io.ByteArrayResource(pdfBytes));
        mailSender.send(message);
    }
}
