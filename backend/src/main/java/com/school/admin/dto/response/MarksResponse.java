package com.school.admin.dto.response;

import java.math.BigDecimal;

public record MarksResponse(
        Long id,
        Long studentId,
        String studentName,
        Long examId,
        String examName,
        Long subjectId,
        String subjectName,
        BigDecimal marksObtained,
        BigDecimal maxMarks,
        String grade,
        String remarks,
        double percentage) {}
