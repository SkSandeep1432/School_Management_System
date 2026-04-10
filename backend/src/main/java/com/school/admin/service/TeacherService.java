package com.school.admin.service;

import com.school.admin.dto.request.AssignTeacherRequest;
import com.school.admin.dto.request.CreateTeacherRequest;
import com.school.admin.dto.response.TeacherAssignmentResponse;
import com.school.admin.dto.response.TeacherResponse;
import com.school.admin.entity.Classes;
import com.school.admin.entity.Section;
import com.school.admin.entity.Subject;
import com.school.admin.entity.Teacher;
import com.school.admin.entity.TeacherAssignment;
import com.school.admin.entity.User;
import com.school.admin.exception.BadRequestException;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.SubjectRepository;
import com.school.admin.repository.TeacherAssignmentRepository;
import com.school.admin.repository.TeacherRepository;
import com.school.admin.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final ClassesRepository classesRepository;
    private final SectionRepository sectionRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;

    public TeacherService(TeacherRepository teacherRepository,
                          UserRepository userRepository,
                          TeacherAssignmentRepository teacherAssignmentRepository,
                          ClassesRepository classesRepository,
                          SectionRepository sectionRepository,
                          SubjectRepository subjectRepository,
                          PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.classesRepository = classesRepository;
        this.sectionRepository = sectionRepository;
        this.subjectRepository = subjectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TeacherResponse createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BadRequestException("Username already exists: " + request.username());
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already exists: " + request.email());
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(User.Role.TEACHER)
                .build();
        user = userRepository.save(user);

        Teacher teacher = Teacher.builder()
                .user(user)
                .fullName(request.fullName())
                .phone(request.phone())
                .build();
        teacher = teacherRepository.save(teacher);

        return mapToResponse(teacher);
    }

    @Transactional(readOnly = true)
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherResponse getTeacherById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
        return mapToResponse(teacher);
    }

    @Transactional
    public TeacherAssignmentResponse assignTeacher(Long teacherId, AssignTeacherRequest request) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + request.subjectId()));

        Classes classes = classesRepository.findById(request.classId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.classId()));

        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + request.sectionId()));

        if (teacherAssignmentRepository.existsByTeacherIdAndSubjectIdAndClassesIdAndSectionId(
                teacherId, request.subjectId(), request.classId(), request.sectionId())) {
            throw new BadRequestException("Teacher is already assigned to this subject, class, and section.");
        }

        TeacherAssignment assignment = TeacherAssignment.builder()
                .teacher(teacher)
                .subject(subject)
                .classes(classes)
                .section(section)
                .build();
        assignment = teacherAssignmentRepository.save(assignment);

        return mapAssignmentToResponse(assignment);
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> getTeacherAssignments(Long teacherId) {
        if (!teacherRepository.existsById(teacherId)) {
            throw new ResourceNotFoundException("Teacher not found with id: " + teacherId);
        }
        return teacherAssignmentRepository.findByTeacherId(teacherId).stream()
                .map(this::mapAssignmentToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Teacher getCurrentTeacher(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return teacherRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found for user: " + username));
    }

    public boolean assignmentExists(Long assignmentId) {
        return teacherAssignmentRepository.existsById(assignmentId);
    }

    @Transactional
    public void removeAssignment(Long assignmentId) {
        teacherAssignmentRepository.deleteById(assignmentId);
    }

    public TeacherResponse mapToResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getFullName(),
                teacher.getPhone(),
                teacher.getUser() != null ? teacher.getUser().getUsername() : null,
                teacher.getUser() != null ? teacher.getUser().getEmail() : null,
                teacher.getUser() != null ? teacher.getUser().getId() : null
        );
    }

    public TeacherAssignmentResponse mapAssignmentToResponse(TeacherAssignment assignment) {
        return new TeacherAssignmentResponse(
                assignment.getId(),
                assignment.getTeacher() != null ? assignment.getTeacher().getId() : null,
                assignment.getTeacher() != null ? assignment.getTeacher().getFullName() : null,
                assignment.getSubject() != null ? assignment.getSubject().getId() : null,
                assignment.getSubject() != null ? assignment.getSubject().getSubjectName() : null,
                assignment.getClasses() != null ? assignment.getClasses().getId() : null,
                assignment.getClasses() != null ? assignment.getClasses().getClassName() : null,
                assignment.getSection() != null ? assignment.getSection().getId() : null,
                assignment.getSection() != null ? assignment.getSection().getSectionName() : null
        );
    }
}
