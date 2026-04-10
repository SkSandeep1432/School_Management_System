package com.school.admin.dto.response;

public record TeacherResponse(
        Long id,
        String fullName,
        String phone,
        String username,
        String email,
        Long userId) {}
