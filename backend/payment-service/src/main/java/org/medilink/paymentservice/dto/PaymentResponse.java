package org.medilink.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentResponse {
    private String razorpayOrderId;
    private String paymentUrl;
    private Double amount;
    private String currency;
    private String razorpayKey;

}
