package org.medilink.bookingservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@NoArgsConstructor
@Table(name = "bookings")
public class Booking {

     @Id
     @GeneratedValue(strategy = GenerationType.AUTO)
     private UUID id;

     @Column(nullable = false)
     private Long equipmentId;

     @Column(nullable = false)
     private UUID userId;

     @Column(nullable = false)
     private LocalDate startDate;

     @Column(nullable = false)
     private LocalDate endDate;

     @Column(nullable = false)
     private Double price;

     @Enumerated(EnumType.STRING)
     private BookingStatus status;
}
