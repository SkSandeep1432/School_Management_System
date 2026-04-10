package com.school.admin.dto.response;

public record AttendanceRecordResponse(
        Long id,
        Long studentId,
        String studentName,
        String attendanceDate,
        String status) {}
