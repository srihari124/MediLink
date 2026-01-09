package org.medilink.paymentservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private PaymentStatus status;
    private String currency;
    private Double amount;
    private LocalDate lastUpdated;
}
