package org.medilink.bookingservice.kafka;

import org.medilink.bookingservice.model.Booking;

import org.medilink.bookingservice.service.BookingService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import booking.events.PaymentStatusEvent;

@Service
public class KafkaConsumer {
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(KafkaConsumer.class);
    private final BookingService bookingService;

    public KafkaConsumer(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @KafkaListener(topics = "payment-status", groupId = "booking-service")
    public void consumeEvent(byte[] event){
        logger.info("Received event: {}", event);
        try {
            PaymentStatusEvent paymentStatusEvent = PaymentStatusEvent.parseFrom(event);
            bookingService.updateBookingStatus(paymentStatusEvent);
            logger.info("Event processed: {}", paymentStatusEvent);
        } catch (Exception e) {
            logger.error("Error processing event: {}", event, e);
            throw new RuntimeException(e);
        }
    }
}
