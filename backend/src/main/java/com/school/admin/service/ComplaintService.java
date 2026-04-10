package com.school.admin.service;

import com.school.admin.dto.request.CreateComplaintRequest;
import com.school.admin.dto.request.ReplyComplaintRequest;
import com.school.admin.dto.response.ComplaintResponse;
import com.school.admin.entity.Complaint;
import com.school.admin.entity.Teacher;
import com.school.admin.entity.User;
import com.school.admin.exception.ResourceNotFoundException;
import com.school.admin.repository.ComplaintRepository;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.TeacherRepository;
import com.school.admin.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final TeacherRepository teacherRepository;

    public ComplaintService(ComplaintRepository complaintRepository,
                            UserRepository userRepository,
                            ParentRepository parentRepository,
                            TeacherRepository teacherRepository) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional
    public ComplaintResponse createComplaint(String username, CreateComplaintRequest request) {
        User parentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + request.teacherId()));

        Complaint complaint = new Complaint();
        complaint.setParent(parentUser);
        complaint.setTeacher(teacher);
        complaint.setSubject(request.subject());
        complaint.setMessage(request.message());
        return mapToResponse(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByParent(String username) {
        User parentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return complaintRepository.findByParentIdOrderByCreatedAtDesc(parentUser.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComplaintResponse> getComplaintsByTeacher(String username) {
        User teacherUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Teacher teacher = teacherRepository.findByUserId(teacherUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found for user: " + username));
        return complaintRepository.findByTeacherIdOrderByCreatedAtDesc(teacher.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public ComplaintResponse replyToComplaint(Long complaintId, String username, ReplyComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found: " + complaintId));
        complaint.setReply(request.reply());
        complaint.setStatus(Complaint.Status.RESOLVED);
        complaint.setResolvedAt(LocalDateTime.now());
        return mapToResponse(complaintRepository.save(complaint));
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        String parentName = c.getParent().getUsername();
        String parentEmail = c.getParent().getEmail();
        return new ComplaintResponse(
                c.getId(),
                parentName,
                parentEmail,
                c.getTeacher().getId(),
                c.getTeacher().getFullName(),
                c.getSubject(),
                c.getMessage(),
                c.getStatus().name(),
                c.getReply(),
                c.getCreatedAt(),
                c.getResolvedAt()
        );
    }
}
