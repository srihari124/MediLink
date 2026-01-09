package org.medilink.bookingservice.service;

import org.medilink.bookingservice.kafka.KafkaProducer;
import org.medilink.bookingservice.model.Booking;
import org.medilink.bookingservice.model.BookingStatus;
import org.medilink.bookingservice.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import booking.events.PaymentStatusEvent;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final KafkaProducer kafkaProducer;
    private final RestTemplate restTemplate;
    private final String equipmentServiceUrl;

    public BookingService(BookingRepository bookingRepository, RestTemplate restTemplate,  @Value( "${equipment.service.url}")  String equipmentServiceUrl, KafkaProducer kafkaProducer) {
        this.bookingRepository = bookingRepository;
        this.restTemplate = restTemplate;
        this.equipmentServiceUrl = equipmentServiceUrl;
        this.kafkaProducer = kafkaProducer;
    }

    public Booking createBooking(Booking booking, UUID userId){
        ResponseEntity<?> equipmentResponse = restTemplate.getForEntity(equipmentServiceUrl + "/" + booking.getEquipmentId(), Object.class);

        if(!equipmentResponse.getStatusCode().is2xxSuccessful()){
            throw new IllegalArgumentException("Invalid equipment id");
        }

        if(hasConflict(booking.getEquipmentId(), booking.getStartDate(), booking.getEndDate())){
            throw new IllegalArgumentException("Booking Conflict is detected");
        }

        booking.setUserId(userId);
        booking.setStatus(BookingStatus.PENDING);
        Booking savedBooking = bookingRepository.save(booking);
        kafkaProducer.sendEventToPaymentService(savedBooking);
        return savedBooking;
    }

    public List<Booking> getBookingsByUserId(UUID userId){
        return bookingRepository.findByUserId(userId);
    }

    public void cancelBooking(UUID id, UUID userId){
        Booking booking = bookingRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("Booking not found"));

        if(!booking.getUserId().equals(userId)){
            throw new SecurityException("Unauthorized access");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.saveAndFlush(booking);
    }

    public void confirmBooking(UUID id, UUID userId){
        Booking booking = bookingRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("Booking not found"));

        if(!booking.getUserId().equals(userId)){
            throw new SecurityException("Unauthorized access");
        }
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.saveAndFlush(booking);
    }

    public boolean hasConflict(Long equipmentId, LocalDate startDate, LocalDate endDate){
        List<Booking> existingList = bookingRepository.findByEquipmentIdAndStatus(equipmentId, BookingStatus.CONFIRMED);
        for(Booking booking: existingList){
            if(!(endDate.isBefore(booking.getStartDate()) || startDate.isAfter(booking.getEndDate()))){
                return true;
            }
        }
        return false;
    }

    public Optional<Booking> getById(UUID id){
        logger.info("Getting booking by id: {}", id);
        return bookingRepository.findById(id);
    }

    public void updateBookingStatus(PaymentStatusEvent event){
        try {
            UUID bookingId = UUID.fromString(event.getBookingId());
            String status = event.getStatus();

            Optional<Booking> optionalBooking = bookingRepository.findById(bookingId);
            if (optionalBooking.isPresent()) {
                Booking booking = optionalBooking.get();

                if ("PROCESSED".equalsIgnoreCase(status)) {
                    booking.setStatus(BookingStatus.CONFIRMED);
                } else if ("REJECTED".equalsIgnoreCase(status)) {
                    booking.setStatus(BookingStatus.CANCELLED);
                }
                kafkaProducer.sendEventToEquipmentService(booking);
                bookingRepository.saveAndFlush(booking);
                logger.info("Booking status updated for booking id: {}", bookingId);
            } else {
                logger.warn("Booking not found for booking id: {}", bookingId);
            }
        } catch (Exception e) {
            logger.error("Error updating booking status for booking id: {}", event.getBookingId(), e);
        }
    }
}
