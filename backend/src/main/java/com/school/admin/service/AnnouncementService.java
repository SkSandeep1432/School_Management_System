package com.school.admin.service;

import com.school.admin.entity.User;
import com.school.admin.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class AnnouncementService {

    private static final Logger logger = LoggerFactory.getLogger(AnnouncementService.class);

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;

    public AnnouncementService(UserRepository userRepository, JavaMailSender mailSender) {
        this.userRepository = userRepository;
        this.mailSender = mailSender;
    }

    public void sendToAll(String subject, String message) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PARENT || u.getRole() == User.Role.TEACHER)
                .toList();
        sendEmails(users, subject, message);
    }

    public void sendToTeachers(String subject, String message) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .toList();
        sendEmails(users, subject, message);
    }

    private void sendEmails(List<User> users, String subject, String message) {
        for (User user : users) {
            try {
                MimeMessage mime = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
                helper.setTo(user.getEmail());
                helper.setSubject(subject);
                helper.setText("<div style='font-family:sans-serif;padding:20px'>"
                        + "<h2 style='color:#3f51b5'>School Announcement</h2>"
                        + "<p>" + message.replace("\n", "<br>") + "</p>"
                        + "<hr><p style='color:#999;font-size:12px'>School Administration System</p></div>", true);
                mailSender.send(mime);
                logger.info("Announcement sent to {}", user.getEmail());
            } catch (Exception e) {
                logger.warn("Failed to send announcement to {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }
}
