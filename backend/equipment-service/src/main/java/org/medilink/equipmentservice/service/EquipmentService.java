package org.medilink.equipmentservice.service;

import equipment.events.BookingStatusEvent;
import org.medilink.equipmentservice.model.Equipment;
import org.medilink.equipmentservice.repository.EquipmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipmentService {

    private static final Logger logger = LoggerFactory.getLogger(EquipmentService.class);

    @Autowired
    private EquipmentRepository equipmentRepository;

    public Equipment addEquipment(Equipment equipment) {
        logger.info("Adding new equipment: {}", equipment.getName());
        Equipment savedEquipment = equipmentRepository.save(equipment);
        logger.info("Equipment added successfully with id: {}", savedEquipment.getId());
        return savedEquipment;
    }

    public List<Equipment> getAllEquipment() {
        logger.info("Fetching all equipment");
        return equipmentRepository.findAll();
    }

    public Optional<Equipment> getEquipmentById(Long id) {
        logger.info("Fetching equipment with id: {}", id);
        return equipmentRepository.findById(id);
    }

    public Equipment updateEquipment(Long id, Equipment updatedEquipment) {
        logger.info("Updating equipment with id: {}", id);
        return equipmentRepository.findById(id).map(equipment -> {
            equipment.setName(updatedEquipment.getName());
            equipment.setType(updatedEquipment.getType());
            equipment.setLocation(updatedEquipment.getLocation());
            equipment.setAvailability(updatedEquipment.getAvailability());
            equipment.setPrice(updatedEquipment.getPrice());
            Equipment savedEquipment = equipmentRepository.save(equipment);
            logger.info("Equipment updated successfully with id: {}", savedEquipment.getId());
            return savedEquipment;
        }).orElseThrow(() -> {
            logger.error("Equipment not found with id: {}", id);
            return new RuntimeException("Equipment not found with id: " + id);
        });
    }

    public List<Equipment> searchEquipment(String type, String location, Boolean availability) {
        logger.info("Searching equipment with type: {}, location: {}, availability: {}", type, location, availability);
        return equipmentRepository.findByTypeAndLocationAndAvailability(type, location, availability);
    }

    public void deleteEquipment(Long id) {
        logger.info("Deleting equipment with id: {}", id);
        equipmentRepository.deleteById(id);
        logger.info("Equipment deleted successfully with id: {}", id);
    }

    public void updateEquipmentAvailability(BookingStatusEvent bookingStatusEvent){
    }
}
