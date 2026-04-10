package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateSectionRequest(
        @NotBlank(message = "Section name is required") String sectionName) {}
