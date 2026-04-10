package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record MarkAttendanceRequest(
        @NotNull(message = "Student ID is required") Long studentId,
        @NotNull(message = "Class ID is required") Long classId,
        @NotNull(message = "Section ID is required") Long sectionId,
        @NotBlank(message = "Attendance date is required") String attendanceDate,
        @NotBlank(message = "Status is required") String status) {}
