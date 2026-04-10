package com.school.admin.service;

import com.school.admin.dto.request.CreateStudentRequest;
import com.school.admin.dto.request.PromoteRequest;
import com.school.admin.dto.response.PromoteResponse;
import com.school.admin.dto.response.StudentResponse;
import com.school.admin.entity.Classes;
import com.school.admin.entity.Section;
import com.school.admin.entity.Student;
import com.school.admin.exception.BadRequestException;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClassesRepository classesRepository;
    private final SectionRepository sectionRepository;

    public StudentService(StudentRepository studentRepository,
                          ClassesRepository classesRepository,
                          SectionRepository sectionRepository) {
        this.studentRepository = studentRepository;
        this.classesRepository = classesRepository;
        this.sectionRepository = sectionRepository;
    }

    @Transactional
    public StudentResponse createStudent(CreateStudentRequest request) {
        Classes classes = classesRepository.findById(request.classId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.classId()));
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + request.sectionId()));

        Student student = Student.builder()
                .fullName(request.fullName())
                .rollNumber(request.rollNumber())
                .classes(classes)
                .section(section)
                .dateOfBirth(request.dateOfBirth() != null ? LocalDate.parse(request.dateOfBirth()) : null)
                .parentEmail(request.parentEmail())
                .phone(request.phone())
                .address(request.address())
                .build();

        return mapToResponse(studentRepository.save(student));
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents(Long classId, Long sectionId) {
        List<Student> students;
        if (classId != null && sectionId != null) {
            students = studentRepository.findByClassesIdAndSectionId(classId, sectionId);
        } else if (classId != null) {
            students = studentRepository.findByClassesId(classId);
        } else {
            students = studentRepository.findAll();
        }
        return students.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return mapToResponse(student);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, CreateStudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        Classes classes = classesRepository.findById(request.classId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found with id: " + request.classId()));
        Section section = sectionRepository.findById(request.sectionId())
                .orElseThrow(() -> new ResourceNotFoundException("Section not found with id: " + request.sectionId()));

        student.setFullName(request.fullName());
        student.setRollNumber(request.rollNumber());
        student.setClasses(classes);
        student.setSection(section);
        student.setDateOfBirth(request.dateOfBirth() != null ? LocalDate.parse(request.dateOfBirth()) : null);
        student.setParentEmail(request.parentEmail());
        student.setPhone(request.phone());
        student.setAddress(request.address());

        return mapToResponse(studentRepository.save(student));
    }

    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Student not found with id: " + id);
        }
        studentRepository.deleteById(id);
    }

    /** Preview what would happen — no DB changes. */
    @Transactional(readOnly = true)
    public PromoteResponse previewPromotion(Long fromClassId, Long toClassId) {
        Classes fromClass = classesRepository.findById(fromClassId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + fromClassId));
        Classes toClass = toClassId != null
                ? classesRepository.findById(toClassId)
                        .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + toClassId))
                : null;

        List<Student> students = studentRepository.findByClassesId(fromClassId);
        String toName = toClass != null ? toClass.getClassName() : "Graduate";

        List<PromoteResponse.PromotedStudentInfo> infos = students.stream()
                .map(s -> {
                    String newRoll = toClass != null
                            ? computeNewRollNumber(s.getRollNumber(), fromClass.getClassName(), toClass.getClassName())
                            : "GRADUATED";
                    if (toClass != null && studentRepository.existsByRollNumber(newRoll)) {
                        int suffix = 2;
                        String base = newRoll;
                        while (studentRepository.existsByRollNumber(base + "-" + suffix)) suffix++;
                        newRoll = base + "-" + suffix;
                    }
                    return new PromoteResponse.PromotedStudentInfo(
                            s.getId(), s.getFullName(), s.getRollNumber(), newRoll,
                            s.getSection() != null ? s.getSection().getSectionName() : "");
                })
                .collect(Collectors.toList());

        return new PromoteResponse(fromClass.getClassName(), toName, students.size(), students.size(),
                "Preview only — no changes made.", infos);
    }

    /** Actually perform the promotion. */
    @Transactional
    public PromoteResponse promoteStudents(PromoteRequest request) {
        Classes fromClass = classesRepository.findById(request.fromClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.fromClassId()));
        Classes toClass = request.toClassId() != null
                ? classesRepository.findById(request.toClassId())
                        .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + request.toClassId()))
                : null;

        if (toClass != null && toClass.getId().equals(fromClass.getId())) {
            throw new BadRequestException("Source and destination class cannot be the same.");
        }

        List<Student> students = studentRepository.findByClassesId(request.fromClassId());
        if (students.isEmpty()) {
            throw new BadRequestException("No students found in class " + fromClass.getClassName() + ".");
        }

        String toName = toClass != null ? toClass.getClassName() : "Graduate";
        List<PromoteResponse.PromotedStudentInfo> infos = new java.util.ArrayList<>();

        if (toClass == null) {
            // Graduate: remove students from the system
            for (Student s : students) {
                infos.add(new PromoteResponse.PromotedStudentInfo(
                        s.getId(), s.getFullName(), s.getRollNumber(), "GRADUATED",
                        s.getSection() != null ? s.getSection().getSectionName() : ""));
            }
            studentRepository.deleteAll(students);
        } else {
            final Classes targetClass = toClass;
            for (Student s : students) {
                String oldRoll = s.getRollNumber();
                String newRoll = computeNewRollNumber(oldRoll, fromClass.getClassName(), targetClass.getClassName());
                // Ensure unique roll number — increment suffix until no collision
                if (studentRepository.existsByRollNumber(newRoll)) {
                    int suffix = 2;
                    String base = newRoll;
                    while (studentRepository.existsByRollNumber(base + "-" + suffix)) {
                        suffix++;
                    }
                    newRoll = base + "-" + suffix;
                }
                infos.add(new PromoteResponse.PromotedStudentInfo(
                        s.getId(), s.getFullName(), oldRoll, newRoll,
                        s.getSection() != null ? s.getSection().getSectionName() : ""));
                s.setClasses(targetClass);
                s.setRollNumber(newRoll);
            }
            studentRepository.saveAll(students);
        }

        return new PromoteResponse(fromClass.getClassName(), toName, students.size(), students.size(),
                toClass != null
                        ? students.size() + " students promoted from Class " + fromClass.getClassName() + " to Class " + toName + "."
                        : students.size() + " Class " + fromClass.getClassName() + " students graduated and removed.",
                infos);
    }

    private String computeNewRollNumber(String rollNumber, String fromClassName, String toClassName) {
        if (rollNumber.startsWith(fromClassName)) {
            return toClassName + rollNumber.substring(fromClassName.length());
        }
        return toClassName + rollNumber; // fallback
    }

    public StudentResponse mapToResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getFullName(),
                student.getRollNumber(),
                student.getClasses() != null ? student.getClasses().getId() : null,
                student.getClasses() != null ? student.getClasses().getClassName() : null,
                student.getSection() != null ? student.getSection().getId() : null,
                student.getSection() != null ? student.getSection().getSectionName() : null,
                student.getDateOfBirth() != null ? student.getDateOfBirth().toString() : null,
                student.getParentEmail(),
                student.getPhone(),
                student.getAddress()
        );
    }
}
