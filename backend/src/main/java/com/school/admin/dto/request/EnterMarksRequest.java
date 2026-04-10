package com.school.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EnterMarksRequest(
        @NotNull(message = "Student ID is required") Long studentId,
        @NotNull(message = "Exam ID is required") Long examId,
        @NotNull(message = "Subject ID is required") Long subjectId,
        @NotNull(message = "Class ID is required") Long classId,
        @NotNull(message = "Section ID is required") Long sectionId,
        @NotNull(message = "Marks obtained is required") BigDecimal marksObtained,
        BigDecimal maxMarks,
        String remarks) {}
