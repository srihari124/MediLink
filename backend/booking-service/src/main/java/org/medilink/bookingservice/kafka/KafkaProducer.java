package org.medilink.bookingservice.kafka;

import booking.events.BookingCreatedEvent;
import booking.events.BookingStatusEvent;
import org.medilink.bookingservice.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducer {
    private static final Logger logger = LoggerFactory.getLogger(KafkaProducer.class);
    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String, byte[]> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendEventToPaymentService(Booking booking){
        BookingCreatedEvent event = BookingCreatedEvent.newBuilder()
                .setBookingId(booking.getId().toString())
                .setAmount(booking.getPrice())
                .setCurrency("INR")
                .setEventType("BOOKING_CREATED")
                .build();

        try{
            kafkaTemplate.send("booking-created", event.toByteArray());
        } catch(Exception e){
            logger.error("Error sending BookingCreated event: {}",event);
        }
    }

    public void sendEventToEquipmentService(Booking booking){
        BookingStatusEvent event = BookingStatusEvent.newBuilder()
                .setEquipmentId(booking.getEquipmentId().toString())
                .setBookingId(booking.getId().toString())
                .setStatus(booking.getStatus().name())
                .build();
        try{
            kafkaTemplate.send("booking-status", event.toByteArray());
        } catch(Exception e){
            logger.error("Error sending BookingStatus event: {}",event);
        }
    }
}
