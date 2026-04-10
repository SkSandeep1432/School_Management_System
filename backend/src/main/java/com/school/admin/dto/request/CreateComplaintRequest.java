package com.school.admin.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
public record CreateComplaintRequest(
    @NotNull Long teacherId,
    @NotBlank String subject,
    @NotBlank String message) {}
