package com.school.admin.dto.response;

public record StudentResponse(
        Long id,
        String fullName,
        String rollNumber,
        Long classId,
        String className,
        Long sectionId,
        String sectionName,
        String dateOfBirth,
        String parentEmail,
        String phone,
        String address) {}
