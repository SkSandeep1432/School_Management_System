package com.school.admin.dto.request;

import jakarta.validation.constraints.NotNull;

public record AssignTeacherRequest(
        @NotNull(message = "Subject ID is required") Long subjectId,
        @NotNull(message = "Class ID is required") Long classId,
        @NotNull(message = "Section ID is required") Long sectionId) {}
