package com.medilink.shared_medical_platform.repository;

import com.medilink.shared_medical_platform.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}
