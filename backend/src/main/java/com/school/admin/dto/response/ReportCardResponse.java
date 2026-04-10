package com.school.admin.dto.response;

import java.util.List;

public record ReportCardResponse(
        Long studentId,
        String studentName,
        String rollNumber,
        String className,
        String sectionName,
        String examName,
        String academicYear,
        List<MarksResponse> subjectMarks,
        double totalMarks,
        double maxTotalMarks,
        double percentage,
        String overallGrade,
        AttendanceSummaryResponse attendanceSummary) {}
