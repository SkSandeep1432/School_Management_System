package com.school.admin.dto.response;

public record TeacherAssignmentResponse(
        Long id,
        Long teacherId,
        String teacherName,
        Long subjectId,
        String subjectName,
        Long classId,
        String className,
        Long sectionId,
        String sectionName) {}
