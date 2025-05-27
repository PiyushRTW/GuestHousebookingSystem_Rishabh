package com.Application.GuestHouseBooking.MailServices;

import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

    @Service
    public class MailService {

        @Autowired
        private JavaMailSender mailSender;

        @Value("${spring.mail.username}") // Sender's email from properties
        private String senderEmail;

        @Value("${app.mail.admin-email}") // Admin's email from properties
        private String adminEmail;

        @Value("${app.mail.app-base-url}") // Base URL from properties
        private String appBaseUrl;

        @Value("${app.mail.admin-pending-bookings-path}") // Admin pending bookings path
        private String adminPendingBookingsPath;

        private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        public void sendBookingNotificationToAdmin(Booking booking, User bookingUser) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(adminEmail);
            message.setSubject("New Pending Booking Notification - ID: " + booking.getId());

            String adminBookingLink = appBaseUrl + adminPendingBookingsPath;

            String emailContent = String.format(
                    "Dear Admin,\n\n" +
                            "A new booking has been created and is awaiting your approval:\n\n" +
                            "Booking ID: %d\n" +
                            "User: %s (Email: %s)\n" +
                            "Bed ID: %d\n" +
                            "Check-in Date: %s\n" +
                            "Check-out Date: %s\n" +
                            "Total Price: %.2f\n" +
                            "Status: %s\n\n" +
                            "Please visit the admin dashboard to review and approve/deny this booking:\n" +
                            "%s\n\n" +
                            "Thank you,\n" +
                            "Your Booking System",
                    booking.getId(),
                    bookingUser.getFirstName() + " " + bookingUser.getLastName(),
                    bookingUser.getEmail(),
                    booking.getBed().getId(),
                    booking.getCheckInDate().format(DATE_FORMATTER),
                    booking.getCheckOutDate().format(DATE_FORMATTER),
                    booking.getTotalPrice(),
                    booking.getStatus().name(),
                    adminBookingLink
            );

            message.setText(emailContent);

            try {
                mailSender.send(message);
                System.out.println("Admin notification email sent for Booking ID: " + booking.getId());
            } catch (MailException e) {
                System.err.println("Error sending admin notification email for Booking ID " + booking.getId() + ": " + e.getMessage());
            }
        }



        public void sendBookingStatusUpdateToUser(Booking booking, User bookingUser, Booking.BookingStatus oldStatus) {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(bookingUser.getEmail());
            message.setSubject("Your Booking Status Update - ID: " + booking.getId());

            String statusMessage = switch (booking.getStatus()) {
                case CONFIRMED -> "Your booking (ID: " + booking.getId() + ") for Bed ID " + booking.getBed().getId() +
                        " from " + booking.getCheckInDate().format(DATE_FORMATTER) + " to " +
                        booking.getCheckOutDate().format(DATE_FORMATTER) + " has been **APPROVED**.\n" +
                        "We look forward to hosting you!";
                case DENIED ->
                        "We regret to inform you that your booking (ID: " + booking.getId() + ") for Bed ID " + booking.getBed().getId() +
                                " from " + booking.getCheckInDate().format(DATE_FORMATTER) + " to " +
                                booking.getCheckOutDate().format(DATE_FORMATTER) + " has been **DENIED**.\n" +
                                "Please contact support for more details or try booking other available beds.";
                case CANCELED -> "Your booking (ID: " + booking.getId() + ") for Bed ID " + booking.getBed().getId() +
                        " from " + booking.getCheckInDate().format(DATE_FORMATTER) + " to " +
                        booking.getCheckOutDate().format(DATE_FORMATTER) + " has been **CANCELED**.";
                default ->
                        "The status of your booking (ID: " + booking.getId() + ") has been updated to: " + booking.getStatus().name() + ".";
            };

            String emailContent = String.format(
                    "Dear %s,\n\n" +
                            "%s\n\n" +
                            "Booking Details:\n" +
                            "  Booking ID: %d\n" +
                            "  Bed ID: %d\n" +
                            "  Check-in: %s\n" +
                            "  Check-out: %s\n" +
                            "  Total Price: %.2f\n" +
                            "  Current Status: %s\n\n" +
                            "Thank you,\n" +
                            "Your Booking System Team",
                    bookingUser.getFirstName(),
                    statusMessage,
                    booking.getId(),
                    booking.getBed().getId(),
                    booking.getCheckInDate().format(DATE_FORMATTER),
                    booking.getCheckOutDate().format(DATE_FORMATTER),
                    booking.getTotalPrice(),
                    booking.getStatus().name()
            );

            message.setText(emailContent);

            try {
                mailSender.send(message);
                System.out.println("User notification email sent to " + bookingUser.getEmail() + " for Booking ID: " + booking.getId());
            } catch (MailException e) {
                System.err.println("Error sending user notification email for Booking ID " + booking.getId() + " to " + bookingUser.getEmail() + ": " + e.getMessage());
            }
        }
    }
