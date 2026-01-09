package org.medilink.paymentservice.controller;

import jakarta.validation.constraints.NotBlank;
import org.medilink.paymentservice.dto.PaymentResponse;
import org.medilink.paymentservice.dto.PaymentVerificationRequest;
import org.medilink.paymentservice.exception.PaymentException;
import org.medilink.paymentservice.service.RazorpayService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final RazorpayService razorpayService;

    public PaymentController(RazorpayService razorpayService) {
        this.razorpayService = razorpayService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebHook(@RequestBody String payload, @RequestHeader("x-razorpay-signature") String signature) {
        try{
            razorpayService.handleWebhook(payload, signature);
            return ResponseEntity.ok("Webhook processed successfully");
        } catch(PaymentException e){
            logger.error("Error handling webhook: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid webhook payload");
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(@PathVariable @NotBlank String orderId){
        try{
            return razorpayService.getPaymentByOrderId(orderId).map(payment -> ResponseEntity.ok(razorpayService.buildPaymentResponse(payment))).orElse(ResponseEntity.notFound().build());
        } catch (Exception e){
            logger.error("Error getting payment status: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/verify-payment")
    public ResponseEntity<Boolean> verifyPayment(@RequestBody PaymentVerificationRequest request) {
        try {
            boolean isValid = razorpayService.verifyPayment(request);
            logger.info("Payment verification result: {}", isValid);
            return ResponseEntity.ok(isValid);
        } catch (Exception e) {
            logger.error("Payment verification failed", e);
            return ResponseEntity.internalServerError()
                    .build();
        }
    }
}