package com.Application.GuestHouseBooking.service.implementations;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.service.GuestHouseServices;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GuestHouseImplementations implements GuestHouseServices {

    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @Autowired
    private AuditLogServices auditLogService; // Inject the AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // Inject ObjectMapper for JSON conversion

    private GuestHouseDTO convertToDTO(GuestHouse guestHouse) {
        GuestHouseDTO dto = new GuestHouseDTO();
        dto.setId(guestHouse.getId());
        dto.setName(guestHouse.getName());
        dto.setAddress(guestHouse.getAddress());
        dto.setCity(guestHouse.getCity());
        dto.setState(guestHouse.getState());
        dto.setCountry(guestHouse.getCountry());
        dto.setDescription(guestHouse.getDescription());
        dto.setAmenities(guestHouse.getAmenities());
        dto.setContactNumber(guestHouse.getContactNumber());
        dto.setEmail(guestHouse.getEmail());
        dto.setImageUrl(guestHouse.getImageUrl());
        dto.setCreatedAt(guestHouse.getCreatedAt());
        dto.setUpdatedAt(guestHouse.getUpdatedAt());
        return dto;
    }

    private GuestHouse convertToEntity(GuestHouseDTO guestHouseDTO) {
        GuestHouse guestHouse = new GuestHouse();
        guestHouse.setId(guestHouseDTO.getId()); // Set ID only for updates
        guestHouse.setName(guestHouseDTO.getName());
        guestHouse.setAddress(guestHouseDTO.getAddress());
        guestHouse.setCity(guestHouseDTO.getCity());
        guestHouse.setState(guestHouseDTO.getState());
        guestHouse.setCountry(guestHouseDTO.getCountry());
        guestHouse.setDescription(guestHouseDTO.getDescription());
        guestHouse.setAmenities(guestHouseDTO.getAmenities());
        guestHouse.setContactNumber(guestHouseDTO.getContactNumber());
        guestHouse.setEmail(guestHouseDTO.getEmail());
        guestHouse.setImageUrl(guestHouseDTO.getImageUrl());
        return guestHouse;
    }

    public GuestHouseDTO createGuestHouse(GuestHouseDTO guestHouseDTO) {
        GuestHouse guestHouse = convertToEntity(guestHouseDTO);
        GuestHouse savedGuestHouse = guestHouseRepository.save(guestHouse);

        // --- Audit Log: CREATE ---
        try {
            auditLogService.logAudit(
                    "GuestHouse",
                    savedGuestHouse.getId(),
                    "CREATE",
                    savedGuestHouse.getCreatedBy(), // Will be filled by Spring Data JPA Auditing
                    null, // No old value for create
                    objectMapper.writeValueAsString(savedGuestHouse), // New value as JSON
                    "New GuestHouse created"
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for GuestHouse creation: " + e.getMessage());
        }
        // --- End Audit Log ---

        return convertToDTO(savedGuestHouse);
    }

    public Optional<GuestHouseDTO> getGuestHouseById(Long id) {
        Optional<GuestHouse> guestHouseOptional = guestHouseRepository.findById(id);
        return guestHouseOptional.map(this::convertToDTO);
    }

    public List<GuestHouseDTO> getAllGuestHouses() {
        try {
            List<GuestHouse> guestHouses = guestHouseRepository.findAll();
            return guestHouses.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error retrieving guest houses from database: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
            throw new RuntimeException("Failed to retrieve guest houses", e);
        }
    }

    public Optional<GuestHouseDTO> updateGuestHouse(Long id, GuestHouseDTO guestHouseDTO) {
        Optional<GuestHouse> existingGuestHouseOptional = guestHouseRepository.findById(id);
        if (existingGuestHouseOptional.isPresent()) {
            GuestHouse existingGuestHouse = existingGuestHouseOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(existingGuestHouse);
            } catch (Exception e) {
                System.err.println("Failed to convert old GuestHouse to JSON: " + e.getMessage());
            }

            // Update fields from DTO to existing entity
            existingGuestHouse.setName(guestHouseDTO.getName());
            existingGuestHouse.setAddress(guestHouseDTO.getAddress());
            existingGuestHouse.setCity(guestHouseDTO.getCity());
            // ... set other fields ...

            GuestHouse updatedGuestHouse = guestHouseRepository.save(existingGuestHouse);

            // --- Audit Log: UPDATE ---
            try {
                auditLogService.logAudit(
                        "GuestHouse",
                        updatedGuestHouse.getId(),
                        "UPDATE",
                        updatedGuestHouse.getLastModifiedBy(), // Will be filled by Spring Data JPA Auditing
                        oldValue,
                        objectMapper.writeValueAsString(updatedGuestHouse), // New value as JSON
                        "GuestHouse updated"
                );
            } catch (Exception e) {
                System.err.println("Failed to log audit for GuestHouse update: " + e.getMessage());
            }
            // --- End Audit Log ---

            return Optional.of(convertToDTO(updatedGuestHouse));
        }
        return Optional.empty();
    }

    public boolean deleteGuestHouse(Long id) {
        Optional<GuestHouse> guestHouseToDeleteOptional = guestHouseRepository.findById(id);
        if (guestHouseToDeleteOptional.isPresent()) {
            GuestHouse guestHouseToDelete = guestHouseToDeleteOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(guestHouseToDelete);
            } catch (Exception e) {
                System.err.println("Failed to convert old GuestHouse to JSON for delete: " + e.getMessage());
            }

            guestHouseRepository.deleteById(id);

            // --- Audit Log: DELETE ---
            auditLogService.logAudit(
                    "GuestHouse",
                    id,
                    "DELETE",
                    "system_user", // Fallback, ideally get from security context during delete operation
                    oldValue,
                    null, // No new value for delete
                    "GuestHouse deleted"
            );
            // --- End Audit Log ---
            return true;
        }
        return false;
    }
}