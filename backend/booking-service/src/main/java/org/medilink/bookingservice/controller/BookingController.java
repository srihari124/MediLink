package org.medilink.bookingservice.controller;

import org.medilink.bookingservice.model.Booking;
import org.medilink.bookingservice.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking, @RequestHeader("X-User-Id") UUID userId){
        logger.info("Creating booking for user: {}", userId);
        Booking newBooking = bookingService.createBooking(booking, userId);
        return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings(@RequestHeader("X-User-Id") UUID userId) {
        logger.info("Fetching all bookings for user: {}", userId);
        return ResponseEntity.ok(bookingService.getBookingsByUserId(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable UUID id){
        logger.info("Getting booking by id: {}", id);
        Optional<Booking> booking = bookingService.getById(id);
        logger.info("Booking found: {}", booking.isPresent());
        return booking.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId){
        logger.info("Canceling booking by id: {}", id);
        bookingService.cancelBooking(id,userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<Void> confirmBooking(@PathVariable UUID id, @RequestHeader("X-User-Id") UUID userId){
        logger.info("Confirming booking by id: {}", id);
        bookingService.confirmBooking(id,userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{equipmentId}/availability")
    public ResponseEntity<Boolean> isAvailable(
            @PathVariable Long equipmentId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        logger.info("Checking availability for equipment id: {} from {} to {}", equipmentId, startDate, endDate);
        boolean conflict = bookingService.hasConflict(equipmentId, startDate, endDate);
        logger.info("Availability check result: {}", conflict);
        return ResponseEntity.ok(!conflict);
    }
}
