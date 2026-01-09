package org.medilink.paymentservice.dto;

import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private String orderId;
    private String paymentId;
    private String signature;
}
