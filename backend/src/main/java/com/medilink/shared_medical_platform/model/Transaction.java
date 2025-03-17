package com.medilink.shared_medical_platform.model;

import com.medilink.shared_medical_platform.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Booking id is required")
    private Long bookingId;

    @NotNull(message = "Amount is required")
    private Double amount;

    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    public Transaction(Long bookingId, Double amount, PaymentStatus paymentStatus){
        this.bookingId = bookingId;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
    }
}
