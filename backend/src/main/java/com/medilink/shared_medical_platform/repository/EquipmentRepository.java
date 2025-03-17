package com.medilink.shared_medical_platform.repository;

import com.medilink.shared_medical_platform.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByTypeAndLocationAndAvailability(String type, String location, Boolean availability);

}
