package com.school.admin.dto.response;

public record AttendanceSummaryResponse(
        Long studentId,
        String studentName,
        long totalDays,
        long presentDays,
        long absentDays,
        long lateDays,
        double percentage) {}
