package org.medilink.paymentservice.kafka;

import booking.events.BookingCreatedEvent;
import com.google.protobuf.InvalidProtocolBufferException;
import org.medilink.paymentservice.service.PaymentProcessor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(KafkaConsumer.class);
    private final PaymentProcessor paymentProcessor;

    public KafkaConsumer(PaymentProcessor paymentProcessor) {
        this.paymentProcessor = paymentProcessor;
    }

    @KafkaListener(topics = "booking-created", groupId = "payment-service")
    public void consumeEvent(byte[] event) {
        try{
            BookingCreatedEvent bookingCreatedEvent = BookingCreatedEvent.parseFrom(event);
            logger.info("Received booking created event: {}", bookingCreatedEvent);
            paymentProcessor.processPayment(bookingCreatedEvent);
        } catch (InvalidProtocolBufferException e) {
            logger.error("Error deseralizing event: {}", e.getMessage());
        }
    }
}
