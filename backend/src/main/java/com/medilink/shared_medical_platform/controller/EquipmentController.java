package com.medilink.shared_medical_platform.controller;

import com.medilink.shared_medical_platform.model.Equipment;
import com.medilink.shared_medical_platform.services.EquipmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private static final Logger logger = LoggerFactory.getLogger(EquipmentController.class);

    @Autowired
    private EquipmentService equipmentService;

    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        logger.info("Adding new equipment: {}", equipment);
        Equipment newEquipment = equipmentService.addEquipment(equipment);
        logger.info("Equipment added with ID: {}", newEquipment.getId());
        return new ResponseEntity<>(newEquipment, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        logger.info("Fetching all equipment");
        List<Equipment> equipmentList = equipmentService.getAllEquipment();
        return new ResponseEntity<>(equipmentList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable Long id) {
        logger.info("Fetching equipment with ID: {}", id);
        Optional<Equipment> equipment = equipmentService.getEquipmentById(id);
        return equipment.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> {
                    logger.warn("Equipment not found with ID: {}", id);
                    return new ResponseEntity<>(HttpStatus.NOT_FOUND);
                });
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment updatedEquipment) {
        logger.info("Updating equipment with ID: {}", id);
        Equipment equipment = equipmentService.updateEquipment(id, updatedEquipment);
        return new ResponseEntity<>(equipment, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        logger.info("Deleting equipment with ID: {}", id);
        equipmentService.deleteEquipment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Equipment>> searchEquipment(@RequestParam String type, @RequestParam String location, @RequestParam Boolean availability) {
        logger.info("Searching equipment with type: {}, location: {}, availability: {}", type, location, availability);
        List<Equipment> equipmentList = equipmentService.searchEquipment(type, location, availability);
        return new ResponseEntity<>(equipmentList, HttpStatus.OK);
    }
}
