package com.school.admin.dto.response;
import java.time.LocalDateTime;
public record ComplaintResponse(
    Long id,
    String parentName,
    String parentEmail,
    Long teacherId,
    String teacherName,
    String subject,
    String message,
    String status,
    String reply,
    LocalDateTime createdAt,
    LocalDateTime resolvedAt) {}
