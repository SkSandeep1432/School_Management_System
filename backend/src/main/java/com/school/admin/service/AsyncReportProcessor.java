package com.school.admin.service;

import com.school.admin.dto.response.ReportCardResponse;
import com.school.admin.entity.Exam;
import com.school.admin.entity.ReportDispatch;
import com.school.admin.entity.Student;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.ReportDispatchRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.util.PdfReportGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.internet.MimeMessage;

/**
 * Separate bean so that @Async + @Transactional(REQUIRES_NEW) are
 * properly intercepted by Spring's proxy (avoids self-invocation problem).
 */
@Service
public class AsyncReportProcessor {

    private static final Logger logger = LoggerFactory.getLogger(AsyncReportProcessor.class);

    private final ExamRepository examRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final MarksService marksService;
    private final PdfReportGenerator pdfReportGenerator;
    private final ReportDispatchRepository reportDispatchRepository;
    private final JavaMailSender mailSender;

    public AsyncReportProcessor(ExamRepository examRepository,
                                StudentRepository studentRepository,
                                ParentRepository parentRepository,
                                MarksService marksService,
                                PdfReportGenerator pdfReportGenerator,
                                ReportDispatchRepository reportDispatchRepository,
                                JavaMailSender mailSender) {
        this.examRepository = examRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.marksService = marksService;
        this.pdfReportGenerator = pdfReportGenerator;
        this.reportDispatchRepository = reportDispatchRepository;
        this.mailSender = mailSender;
    }

    /**
     * Runs in its own thread (@Async) with its own writable transaction (@Transactional REQUIRES_NEW).
     * Failures for one student never affect others.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void processStudent(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId).orElse(null);
        Student student = studentRepository.findById(studentId).orElse(null);
        if (exam == null || student == null) return;

        ReportDispatch.DispatchStatus dispatchStatus = ReportDispatch.DispatchStatus.SENT;

        try {
            ReportCardResponse reportCard = marksService.getStudentReportCard(studentId, examId);
            byte[] pdfBytes = pdfReportGenerator.generateReportCard(reportCard);

            // Prefer registered parent email, fall back to student.parentEmail
            String recipientEmail = parentRepository.findByStudentId(studentId)
                    .map(p -> p.getUser().getEmail())
                    .filter(e -> e != null && !e.isBlank())
                    .orElse(student.getParentEmail());

            if (recipientEmail != null && !recipientEmail.isBlank()) {
                sendReportEmail(recipientEmail, student.getFullName(), exam.getExamName(), pdfBytes);
                logger.info("Report sent for student: {}", student.getFullName());
            } else {
                logger.warn("No parent email found for student: {}", student.getFullName());
                dispatchStatus = ReportDispatch.DispatchStatus.FAILED;
            }

        } catch (Exception e) {
            logger.error("Failed to generate/send report for student {}: {}", student.getFullName(), e.getMessage());
            dispatchStatus = ReportDispatch.DispatchStatus.FAILED;
        }

        // Always log the dispatch record (success or failure)
        ReportDispatch dispatch = ReportDispatch.builder()
                .exam(exam)
                .student(student)
                .sentToEmail(student.getParentEmail() != null ? student.getParentEmail() : "N/A")
                .status(dispatchStatus)
                .build();
        reportDispatchRepository.save(dispatch);
    }

    private void sendReportEmail(String to, String studentName, String examName, byte[] pdfBytes) throws Exception {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(to);
        helper.setSubject("Report Card - " + examName + " for " + studentName);
        helper.setText("Dear Parent,\n\nPlease find attached the report card for "
                + studentName + " for " + examName + ".\n\nRegards,\nSchool Administration");
        helper.addAttachment(studentName + "_" + examName + "_ReportCard.pdf",
                new ByteArrayResource(pdfBytes));
        mailSender.send(message);
    }
}
