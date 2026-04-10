package com.school.admin.dto.response;

import java.util.List;

public record PromoteResponse(
        String fromClassName,
        String toClassName,
        int totalStudents,
        int promotedCount,
        String message,
        List<PromotedStudentInfo> students
) {
    public record PromotedStudentInfo(
            Long id,
            String fullName,
            String oldRollNumber,
            String newRollNumber,
            String sectionName
    ) {}
}
