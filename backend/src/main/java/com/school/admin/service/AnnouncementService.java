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
import org.springframework.core.io.ByteArrayResource;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
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
                .filter(email -> email != null && !email.isBlank())
                .forEach(emails::add);

        studentRepository.findDistinctParentEmails().stream()
                .filter(email -> email != null && !email.isBlank())
                .forEach(emails::add);

        sendEmails(new ArrayList<>(emails), subject, message);
    }

    public void sendToTeachers(String subject, String message) {
        List<String> emails = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .toList();
        sendEmails(emails, subject, message);
    }

    public void sendToParents(String subject, String message) {
        List<String> emails = studentRepository.findDistinctParentEmails();
        sendEmails(emails, subject, message);
    }

    // ── Receipt email with PDF attachment ─────────────────────────────
    public void sendReceiptEmail(String toEmail, String studentName, String receiptNumber,
                                  Map<String, Object> payment, byte[] pdfBytes) {
        try {
            MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("Payment Receipt " + receiptNumber + " | School Administration System");
            helper.setText(buildReceiptHtml(studentName, receiptNumber, payment), true);
            helper.addAttachment(receiptNumber + ".pdf", new ByteArrayResource(pdfBytes), "application/pdf");
            mailSender.send(mime);
            logger.info("Receipt email sent to {}", toEmail);
        } catch (Exception e) {
            logger.warn("Failed to send receipt email to {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildReceiptHtml(String studentName, String receiptNumber, Map<String, Object> payment) {
        double amount = 0;
        try { amount = Double.parseDouble(payment.getOrDefault("amount", "0").toString()); } catch (Exception ignored) {}
        String amtFormatted = String.format("%.0f", amount);

        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f0f2f5;padding:24px'>"

            // ── Header banner ──
            + "<div style='background:linear-gradient(135deg,#1a237e,#3f51b5);padding:32px 24px;border-radius:14px 14px 0 0;text-align:center'>"
            + "<div style='font-size:36px;margin-bottom:8px'>🎓</div>"
            + "<h1 style='color:#fff;margin:0;font-size:22px;letter-spacing:0.5px'>School Administration System</h1>"
            + "<p style='color:#c5cae9;margin:6px 0 0;font-size:13px'>Fee Payment Receipt</p>"
            + "</div>"

            // ── White card body ──
            + "<div style='background:#fff;padding:32px 28px;border-radius:0 0 14px 14px;box-shadow:0 4px 18px rgba(0,0,0,0.1)'>"

            // Greeting
            + "<p style='color:#333;font-size:16px;margin-top:0'>Dear Parent / Guardian,</p>"
            + "<p style='color:#555;font-size:14px;line-height:1.6'>We are pleased to confirm that the following fee payment has been <strong>successfully recorded</strong> for your ward. "
            + "Please find the payment details below, and a <strong>PDF receipt</strong> is attached for your records.</p>"

            // ── Details box ──
            + "<div style='background:#f0f2ff;border-radius:10px;padding:20px;margin:20px 0'>"
            + "<table style='width:100%;border-collapse:collapse;font-size:14px'>"
            + row("Student Name",   studentName)
            + row("Receipt No.",    receiptNumber)
            + row("Payment Date",   payment.getOrDefault("paymentDate",  "").toString())
            + row("Payment Mode",   payment.getOrDefault("paymentMode",  "").toString())
            + row("Academic Year",  payment.getOrDefault("academicYear", "").toString())
            + "</table>"
            + "</div>"

            // ── Amount paid highlight ──
            + "<div style='background:linear-gradient(135deg,#e8f5e9,#c8e6c9);border-radius:10px;padding:20px;text-align:center;margin:20px 0'>"
            + "<p style='color:#1b5e20;font-size:13px;margin:0 0 6px;font-weight:600;text-transform:uppercase;letter-spacing:1px'>Amount Paid</p>"
            + "<p style='color:#1b5e20;font-size:36px;font-weight:bold;margin:0'>&#8377;" + amtFormatted + "</p>"
            + "</div>"

            // PDF note
            + "<div style='background:#fff8e1;border-left:4px solid #ffc107;border-radius:6px;padding:14px 16px;margin:20px 0'>"
            + "<p style='color:#795548;font-size:13px;margin:0'>📎 A PDF copy of this receipt is <strong>attached</strong> to this email. "
            + "Please keep it safe for future reference. For any queries, contact the school office.</p>"
            + "</div>"

            + "<p style='color:#555;font-size:14px;margin-bottom:4px'>Thank you for your timely payment! 🙏</p>"
            + "<p style='color:#555;font-size:14px;margin-top:0'>Warm regards,<br>"
            + "<strong style='color:#1a237e'>School Administration Team</strong></p>"

            // Footer
            + "<hr style='border:none;border-top:1px solid #eee;margin:24px 0'>"
            + "<p style='color:#aaa;font-size:11px;text-align:center;margin:0'>"
            + "This is an auto-generated email. Please do not reply to this message.</p>"
            + "</div></div>";
    }

    private String row(String label, String value) {
        return "<tr>"
            + "<td style='padding:8px 6px;color:#666;vertical-align:top'>" + label + "</td>"
            + "<td style='padding:8px 6px;color:#1a237e;font-weight:bold;text-align:right'>" + (value != null ? value : "-") + "</td>"
            + "</tr>";
    }

    // ─────────────────────────────────────────────────────────────────
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
