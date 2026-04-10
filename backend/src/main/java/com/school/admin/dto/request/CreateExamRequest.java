package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateExamRequest(
        @NotBlank(message = "Exam name is required") String examName,
        @NotBlank(message = "Exam type is required") String examType,
        @NotBlank(message = "Academic year is required") String academicYear,
        String startDate,
        String endDate) {}
