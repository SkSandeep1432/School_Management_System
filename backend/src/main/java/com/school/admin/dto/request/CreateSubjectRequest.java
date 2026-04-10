package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateSubjectRequest(
        @NotBlank(message = "Subject name is required")
        @Size(min = 2, max = 100, message = "Subject name must be between 2 and 100 characters")
        String subjectName) {}
