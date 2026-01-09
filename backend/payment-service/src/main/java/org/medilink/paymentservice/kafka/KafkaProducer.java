package org.medilink.paymentservice.kafka;

import org.medilink.paymentservice.model.Payment;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import payment.events.PaymentStatusEvent;

@Service
public class KafkaProducer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(KafkaProducer.class);
    private final KafkaTemplate<String, byte[]> kafkaTemplate;

    public KafkaProducer(KafkaTemplate<String,byte[]> kafkaTemplate){
        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendPaymentEvent(Payment payment){
        try{
            PaymentStatusEvent event = PaymentStatusEvent.newBuilder()
                    .setBookingId(payment.getOrderId())
                    .setStatus(payment.getStatus().name())
                    .setAmount(payment.getAmount())
                    .setTimestamp(payment.getLastUpdated().toString())
                    .build();
            logger.info("Sending payment status event: {}", event);
            kafkaTemplate.send("payment-status", event.toByteArray());
        } catch(Exception e){
            logger.error("Error sending payment status event to booking service: {}", e.getMessage());
        }
    }
}
