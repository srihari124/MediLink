package org.medilink.paymentservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PaymentRequest {
    private Double amount;
    private String currency;
    private String bookingId;
}
