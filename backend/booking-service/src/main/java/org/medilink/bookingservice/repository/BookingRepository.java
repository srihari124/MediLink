package org.medilink.bookingservice.repository;

import org.medilink.bookingservice.model.Booking;
import org.medilink.bookingservice.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking,UUID> {
    Optional<Booking> findById(UUID id);
    List<Booking> findByUserId(UUID userId);
    List<Booking> findByEquipmentIdAndStatus(Long equipmentId, BookingStatus status);
}
