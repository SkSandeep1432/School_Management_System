package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateClassRequest(
        @NotBlank(message = "Class name is required") String className) {}
