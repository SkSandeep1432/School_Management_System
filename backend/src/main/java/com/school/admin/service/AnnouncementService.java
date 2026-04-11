package com.school.admin.service;

import com.school.admin.entity.User;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class AnnouncementService {

    private static final Logger logger = LoggerFactory.getLogger(AnnouncementService.class);

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final JavaMailSender mailSender;

    public AnnouncementService(UserRepository userRepository,
                               StudentRepository studentRepository,
                               JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.mailSender = mailSender;
    }

    public void sendToAll(String subject, String message) {
        // Collect unique emails: all teacher user emails + all student parent emails
        Set<String> emails = new LinkedHashSet<>();

        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(User::getEmail)
                .forEach(emails::add);

        emails.addAll(studentRepository.findDistinctParentEmails());

        sendEmails(new ArrayList<>(emails), subject, message);
    }

    public void sendToTeachers(String subject, String message) {
        List<String> emails = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(User::getEmail)
                .toList();
        sendEmails(emails, subject, message);
    }

    public void sendToParents(String subject, String message) {
        List<String> emails = studentRepository.findDistinctParentEmails();
        sendEmails(emails, subject, message);
    }

    private void sendEmails(List<String> emails, String subject, String message) {
        for (String email : emails) {
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
                helper.setTo(email);
                helper.setSubject(subject);
                helper.setText("<div style='font-family:sans-serif;padding:20px'>"
                        + "<h2 style='color:#3f51b5'>School Announcement</h2>"
                        + "<p>" + message.replace("\n", "<br>") + "</p>"
                        + "<hr><p style='color:#999;font-size:12px'>School Administration System</p></div>", true);
                mailSender.send(mime);
                logger.info("Announcement sent to {}", email);
            } catch (Exception e) {
                logger.warn("Failed to send announcement to {}: {}", email, e.getMessage());
            }
        }
    }
}
