package com.medilink.shared_medical_platform.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Entity
@Data
@NoArgsConstructor
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Availability is required")
    private Boolean availability;

    @NotNull(message = "Price is required")
    private Double price;

    public Equipment(String name, String type, String location, Boolean availability, Double price){
        this.name = name;
        this.type = type;
        this.availability = availability;
        this.price = price;
        this.location = location;
    }
}
