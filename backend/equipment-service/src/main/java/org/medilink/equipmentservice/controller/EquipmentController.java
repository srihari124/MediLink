package org.medilink.equipmentservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.medilink.equipmentservice.model.Equipment;
import org.medilink.equipmentservice.service.EquipmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/equipments")
@Tag(name = "Equipment", description = "API for managing equipments")
public class EquipmentController {

    private static final Logger logger = LoggerFactory.getLogger(EquipmentController.class);

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService){
        this.equipmentService = equipmentService;
    }

    @PostMapping("/add")
    @Operation(summary = "Add new equipment")
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        logger.info("Adding new equipment: {}", equipment);
        Equipment newEquipment = equipmentService.addEquipment(equipment);
        logger.info("Equipment added with ID: {}", newEquipment.getId());
        return new ResponseEntity<>(newEquipment, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all equipments")
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        logger.info("Fetching all equipment");
        List<Equipment> equipmentList = equipmentService.getAllEquipment();
        return new ResponseEntity<>(equipmentList, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get equipment by ID")
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
    @Operation(summary = "Update existing equipment")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment updatedEquipment) {
        logger.info("Updating equipment with ID: {}", id);
        Equipment equipment = equipmentService.updateEquipment(id, updatedEquipment);
        return new ResponseEntity<>(equipment, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete existing equipment")
    @PreAuthorize("hasRole('HOSPITAL_ADMIN')")
    public ResponseEntity<Void> deleteEquipment(@PathVariable Long id) {
        logger.info("Deleting equipment with ID: {}", id);
        equipmentService.deleteEquipment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/search")
    @Operation(summary = "Search equipments by type, location and availability")
    public ResponseEntity<List<Equipment>> searchEquipment(@RequestParam String type, @RequestParam String location, @RequestParam Boolean availability) {
        logger.info("Searching equipment with type: {}, location: {}, availability: {}", type, location, availability);
        List<Equipment> equipmentList = equipmentService.searchEquipment(type, location, availability);
        return new ResponseEntity<>(equipmentList, HttpStatus.OK);
    }
}