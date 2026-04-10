package com.school.admin.dto.response;

public record ExamResponse(
        Long id,
        String examName,
        String examType,
        String academicYear,
        String startDate,
        String endDate,
        boolean isLocked) {}
