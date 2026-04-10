package com.school.admin.dto.response;

public record AuthResponse(
        String token,
        String role,
        String username,
        Long userId) {}
