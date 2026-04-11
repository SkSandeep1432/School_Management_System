package com.school.admin.service;

import com.school.admin.dto.response.MessageResponse;
import com.school.admin.dto.response.ReportCardResponse;
import com.school.admin.entity.Mark;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ExamRepository;
import com.school.admin.repository.MarksRepository;
import com.school.admin.util.PdfReportGenerator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ExamRepository examRepository;
    private final MarksRepository marksRepository;
    private final MarksService marksService;
    private final PdfReportGenerator pdfReportGenerator;
    private final AsyncReportProcessor asyncReportProcessor;

    public ReportService(ExamRepository examRepository,
                         MarksRepository marksRepository,
                         MarksService marksService,
                         PdfReportGenerator pdfReportGenerator,
                         AsyncReportProcessor asyncReportProcessor) {
        this.examRepository = examRepository;
        this.marksRepository = marksRepository;
        this.marksService = marksService;
        this.pdfReportGenerator = pdfReportGenerator;
        this.asyncReportProcessor = asyncReportProcessor;
    }

    /**
     * Loads student IDs and returns immediately.
     * Each student is processed in a separate async thread with its own transaction.
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

        // Delegate to a separate bean so @Async + @Transactional(REQUIRES_NEW) work via Spring proxy
        for (Long studentId : studentIds) {
            asyncReportProcessor.processStudent(examId, studentId);
        }

        return new MessageResponse("Report generation started for " + studentIds.size()
                + " students. Emails will be sent in the background.");
    }

    public byte[] generateReportPdf(Long studentId, Long examId) {
        ReportCardResponse reportCard = marksService.getStudentReportCard(studentId, examId);
        return pdfReportGenerator.generateReportCard(reportCard);
    }
}
