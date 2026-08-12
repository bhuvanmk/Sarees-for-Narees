package com.sareesfornaaris.auth.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${MAIL_FROM:${spring.mail.username:}}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        String subject = "Sarees For Naaris - Your Verification Code";
        String htmlContent = buildEmailTemplate(
                "Verification Code",
                "Hello Naari,",
                "Use the following OTP code to complete your " + purpose.toLowerCase() + ":",
                otpCode,
                "This code is valid for 10 minutes. Do not share it with anyone."
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    public void sendPasswordChangedEmail(String toEmail) {
        String subject = "Sarees For Naaris - Password Changed";
        String htmlContent = buildEmailTemplate(
                "Password Security Alert",
                "Hello Naari,",
                "Your Sarees For Naaris account password was updated successfully.",
                null,
                "If you did not perform this change, please contact customer support immediately."
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    public void sendOrderConfirmationEmail(String toEmail, String orderId, String amount) {
        String subject = "Sarees For Naaris - Order Confirmation #" + orderId;
        String htmlContent = buildEmailTemplate(
                "Order Confirmed!",
                "Thank you for shopping with us!",
                "Your order <strong>#" + orderId + "</strong> for total <strong>₹" + amount + "</strong> has been confirmed.",
                orderId,
                "We are preparing your handcrafted sarees with love and care."
        );
        sendHtmlEmail(toEmail, subject, htmlContent);
    }

    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            return;
        }

        // 1. Try Brevo HTTP API if BREVO_API_KEY is present (Bypasses all SMTP port blocks & sends to ANY recipient)
        String brevoApiKey = System.getenv("BREVO_API_KEY");
        if (brevoApiKey != null && !brevoApiKey.trim().isEmpty()) {
            try {
                logger.info("[EMAIL SERVICE] Dispatching email via Brevo HTTP REST API to: {}", toEmail);
                boolean success = sendViaBrevoApi(brevoApiKey.trim(), toEmail, subject, htmlContent);
                if (success) {
                    logger.info("[EMAIL SERVICE] Email successfully delivered via Brevo HTTP API to: {}", toEmail);
                    return;
                }
            } catch (Exception e) {
                logger.error("[EMAIL ERROR] Brevo HTTP API dispatch failed: {}. Trying next fallback...", e.getMessage());
            }
        }

        // 2. Try Resend HTTP API if RESEND_API_KEY environment variable is present
        String resendApiKey = System.getenv("RESEND_API_KEY");
        if (resendApiKey != null && !resendApiKey.trim().isEmpty()) {
            try {
                logger.info("[EMAIL SERVICE] Dispatching email via Resend HTTP REST API to: {}", toEmail);
                boolean success = sendViaResendApi(resendApiKey.trim(), toEmail, subject, htmlContent);
                if (success) {
                    logger.info("[EMAIL SERVICE] Email successfully delivered via Resend HTTP API to: {}", toEmail);
                    return;
                }
            } catch (Exception e) {
                logger.error("[EMAIL ERROR] Resend HTTP API dispatch failed: {}. Falling back to JavaMailSender...", e.getMessage());
            }
        }

        // 2. Fallback to JavaMailSender SMTP
        if (mailSender == null || fromEmail == null || fromEmail.trim().isEmpty()) {
            logger.warn("[EMAIL SERVICE] Mail sender not configured. Skipping SMTP email to: {}", toEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            logger.info("[EMAIL SERVICE] Email successfully sent via SMTP to: {}", toEmail);
        } catch (Exception e) {
            logger.error("[EMAIL ERROR] Failed to send email to {}: {}", toEmail, e.getMessage());
        }
    }

    private boolean sendViaBrevoApi(String apiKey, String toEmail, String subject, String htmlContent) {
        try {
            java.net.URL url = new java.net.URL("https://api.brevo.com/v3/smtp/email");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("api-key", apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("Accept", "application/json");
            conn.setDoOutput(true);

            String senderName = "Sarees For Naaris";
            String senderEmail = fromEmail != null && !fromEmail.trim().isEmpty() ? fromEmail : "teamvelocity4you@gmail.com";

            String jsonPayload = String.format(
                    "{\"sender\":{\"name\":\"%s\",\"email\":\"%s\"},\"to\":[{\"email\":\"%s\"}],\"subject\":\"%s\",\"htmlContent\":%s}",
                    senderName,
                    senderEmail,
                    toEmail,
                    escapeJson(subject),
                    escapeJsonValue(htmlContent)
            );

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            return responseCode == 200 || responseCode == 201;
        } catch (Exception e) {
            logger.error("Brevo API HTTP error: {}", e.getMessage());
            return false;
        }
    }

    private boolean sendViaResendApi(String apiKey, String toEmail, String subject, String htmlContent) {
        try {
            java.net.URL url = new java.net.URL("https://api.resend.com/emails");
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Authorization", "Bearer " + apiKey);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);

            String sender = fromEmail != null && !fromEmail.trim().isEmpty() ? fromEmail : "onboarding@resend.dev";
            
            // Build JSON payload safely
            String jsonPayload = String.format(
                    "{\"from\":\"Sarees For Naaris <%s>\",\"to\":[\"%s\"],\"subject\":\"%s\",\"html\":%s}",
                    sender,
                    toEmail,
                    escapeJson(subject),
                    escapeJsonValue(htmlContent)
            );

            try (java.io.OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            return responseCode == 200 || responseCode == 201;
        } catch (Exception e) {
            logger.error("Resend API HTTP error: {}", e.getMessage());
            return false;
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "\"\"";
        return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r") + "\"";
    }

    private String escapeJsonValue(String text) {
        if (text == null) return "\"\"";
        return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t") + "\"";
    }

    private String buildEmailTemplate(String headerTitle, String greeting, String bodyText, String codeBox, String footerNote) {
        StringBuilder sb = new StringBuilder();
        sb.append("<!DOCTYPE html><html><head><meta charset='UTF-8'></head>");
        sb.append("<body style='font-family: Arial, sans-serif; background-color: #FAF6F0; margin: 0; padding: 20px;'>");
        sb.append("<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #E5D5C5;'>");
        
        // Brand Header
        sb.append("<div style='background-color: #70161E; color: #D4AF37; padding: 24px; text-align: center;'>");
        sb.append("<h1 style='margin: 0; font-family: Georgia, serif; font-size: 24px; letter-spacing: 2px;'>SAREES FOR NAARIS</h1>");
        sb.append("<p style='margin: 5px 0 0 0; font-size: 12px; color: #F7E7CE;'>Pure Handloom Elegance</p>");
        sb.append("</div>");

        // Content Body
        sb.append("<div style='padding: 30px; color: #333333;'>");
        sb.append("<h2 style='color: #70161E; margin-top: 0;'>").append(headerTitle).append("</h2>");
        sb.append("<p style='font-size: 15px;'>").append(greeting).append("</p>");
        sb.append("<p style='font-size: 14px; line-height: 1.6;'>").append(bodyText).append("</p>");

        if (codeBox != null && !codeBox.isEmpty()) {
            sb.append("<div style='background-color: #FAF6F0; border: 1px dashed #D4AF37; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;'>");
            sb.append("<span style='font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #70161E;'>").append(codeBox).append("</span>");
            sb.append("</div>");
        }

        sb.append("<p style='font-size: 13px; color: #777777;'>").append(footerNote).append("</p>");
        sb.append("</div>");

        // Footer
        sb.append("<div style='background-color: #FAF6F0; padding: 15px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #E5D5C5;'>");
        sb.append("<p style='margin: 0;'>© 2026 Sarees For Naaris. All rights reserved.</p>");
        sb.append("</div></div></body></html>");

        return sb.toString();
    }
}
