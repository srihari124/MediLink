package com.medilink.shared_medical_platform.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendNotification(String message, String email){
        SimpleMailMessage mailMessage = new SimpleMailMessage();
        mailMessage.setTo(email);
        mailMessage.setSubject("Booking Notification");
        mailMessage.setText(message);

        javaMailSender.send(mailMessage);
        System.out.println("Notification sent to " + email + ": " + message);
    }
}
