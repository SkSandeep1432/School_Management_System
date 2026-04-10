package com.school.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateStudentRequest(
        @NotBlank(message = "Full name is required") String fullName,
        @NotBlank(message = "Roll number is required") String rollNumber,
        @NotNull(message = "Class ID is required") Long classId,
        @NotNull(message = "Section ID is required") Long sectionId,
        String dateOfBirth,
        String parentEmail,
        String phone,
        String address) {}
