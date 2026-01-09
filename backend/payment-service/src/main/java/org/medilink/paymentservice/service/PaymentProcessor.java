package org.medilink.paymentservice.service;

import booking.events.BookingCreatedEvent;
import org.medilink.paymentservice.dto.PaymentRequest;
import org.springframework.stereotype.Service;

@Service
public class PaymentProcessor {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PaymentProcessor.class);
    private final RazorpayService razorpayService;

    public PaymentProcessor(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    public void processPayment(BookingCreatedEvent event){
        try{
            PaymentRequest paymentRequest = PaymentRequest.builder()
                    .bookingId(event.getBookingId())
                    .amount(event.getAmount())
                    .currency(event.getCurrency())
                    .build();
            logger.info("Processing payment {}", paymentRequest);
            razorpayService.createPayment(paymentRequest);
        } catch(Exception e){
            logger.error("Failed to process payment {} : {}", event.getBookingId(), e.getMessage());
        }
    }
}
