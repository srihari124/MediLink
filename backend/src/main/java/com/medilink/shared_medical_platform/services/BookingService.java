package com.medilink.shared_medical_platform.services;

import com.medilink.shared_medical_platform.enums.BookingStatus;
import com.medilink.shared_medical_platform.model.Booking;
import com.medilink.shared_medical_platform.model.User;
import com.medilink.shared_medical_platform.repository.BookingRepository;
import com.medilink.shared_medical_platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;

@Service
public class BookingService {

    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    public Booking createBooking(Booking booking) {
        logger.info("Creating booking for user ID: {}", booking.getUserId());
        booking.setStatus(BookingStatus.PENDING);
        Booking newBooking = bookingRepository.save(booking);

        String userEmail = getUserEmail(booking.getUserId());
        if (userEmail != null) {
            notificationService.sendNotification("Your booking has been created! Booking ID: " + newBooking.getId(), userEmail);
        }
        logger.info("Booking created successfully with ID: {}", newBooking.getId());
        return newBooking;
    }

    public List<Booking> getAllBookings() {
        logger.info("Fetching all bookings");
        return bookingRepository.findAll();
    }

    public Optional<Booking> getBookingById(Long id) {
        logger.info("Fetching booking with ID: {}", id);
        return bookingRepository.findById(id);
    }

    public Booking updateBooking(Long id, Booking updatedBooking) {
        logger.info("Updating booking with ID: {}", id);
        return bookingRepository.findById(id).map(booking -> {
            booking.setEquipmentId(updatedBooking.getEquipmentId());
            booking.setUserId(updatedBooking.getUserId());
            booking.setStartDate(updatedBooking.getStartDate());
            booking.setEndDate(updatedBooking.getEndDate());
            booking.setStatus(updatedBooking.getStatus());
            Booking savedBooking = bookingRepository.save(booking);
            logger.info("Booking updated successfully with ID: {}", savedBooking.getId());
            return savedBooking;
        }).orElseThrow(() -> {
            logger.error("Booking not found with ID: {}", id);
            return new RuntimeException("Booking not found with ID: " + id);
        });
    }

    public void deleteBooking(Long id) {
        logger.info("Deleting booking with ID: {}", id);
        bookingRepository.deleteById(id);
        logger.info("Booking deleted successfully with ID: {}", id);
    }

    public Booking confirmBooking(Long bookingId) {
        logger.info("Confirming booking with ID: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> {
            logger.error("Booking not found with ID: {}", bookingId);
            return new RuntimeException("Booking not found with ID: " + bookingId);
        });

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        String userEmail = getUserEmail(booking.getUserId());
        if (userEmail != null) {
            notificationService.sendNotification("Your booking has been confirmed! Booking ID: " + booking.getId(), userEmail);
        }
        logger.info("Booking confirmed successfully with ID: {}", booking.getId());
        return booking;
    }

    public Booking completeBooking(Long bookingId) {
        logger.info("Completing booking with ID: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> {
            logger.error("Booking not found with ID: {}", bookingId);
            return new RuntimeException("Booking not found with ID: " + bookingId);
        });

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        String userEmail = getUserEmail(booking.getUserId());
        if (userEmail != null) {
            notificationService.sendNotification("Your booking has been completed. Booking ID: " + booking.getId(), userEmail);
        }
        logger.info("Booking completed successfully with ID: {}", booking.getId());
        return booking;
    }

    private String getUserEmail(Long userId) {
        logger.info("Fetching email for user ID: {}", userId);
        Optional<User> user = userRepository.findById(userId);
        return user.map(User::getEmail).orElse(null);
    }
}
