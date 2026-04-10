package com.school.admin.dto.request;
import jakarta.validation.constraints.NotBlank;
public record ReplyComplaintRequest(@NotBlank String reply) {}
