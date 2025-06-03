package com.Application.GuestHouseBooking.service.implementations;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.service.RoomServices;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class RoomServiceImplementations implements RoomServices {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private GuestHouseRepository guestHouseRepository; // To fetch associated GuestHouse

    @Autowired
    private AuditLogServices auditLogService; // <<< Inject AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // <<< Inject ObjectMapper

    private RoomDTO convertToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setGuestHouseId(room.getGuestHouse().getId()); // Get ID from associated GuestHouse
        dto.setRoomNumber(room.getRoomNumber());
        dto.setDescription(room.getDescription());
        dto.setAmenities(room.getAmenities());
        dto.setImageUrl(room.getImageUrl());
        dto.setCreatedAt(room.getCreatedAt());
        dto.setUpdatedAt(room.getUpdatedAt());
        return dto;
    }

    private Room convertToEntity(RoomDTO roomDTO) {
        Room room = new Room();
        room.setId(roomDTO.getId());

        // Fetch the associated GuestHouse
        GuestHouse guestHouse = guestHouseRepository.findById(roomDTO.getGuestHouseId())
                .orElseThrow(() -> new RuntimeException("GuestHouse not found with ID: " + roomDTO.getGuestHouseId()));
        room.setGuestHouse(guestHouse);

        room.setRoomNumber(roomDTO.getRoomNumber());
        room.setDescription(roomDTO.getDescription());
        room.setAmenities(roomDTO.getAmenities());
        room.setImageUrl(roomDTO.getImageUrl());
        return room;
    }

    // --- CRUD Operations ---

    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room savedRoom = roomRepository.save(room);
        try {
            auditLogService.logAudit(
                    "Room",
                    savedRoom.getId(),
                    "CREATE",
                    savedRoom.getCreatedBy(), // This will be populated by Spring Data JPA Auditing
                    null, // No old value for create
                    objectMapper.writeValueAsString(savedRoom), // New value as JSON
                    "New Room registered"
            );
        } catch (JsonProcessingException e) {
            System.err.println("Failed to log audit for Room creation: " + e.getMessage());
        }
        return convertToDTO(savedRoom);
    }

    @Override
    public Optional<RoomDTO> getRoomById(Long id) {
        return roomRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<RoomDTO> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getRoomsByGuestHouseId(Long guestHouseId) {
        return roomRepository.findByGuestHouseId(guestHouseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<RoomDTO> updateRoom(Long id, RoomDTO roomDTO) {
        Optional<Room> existingRoomOptional = roomRepository.findById(id);
        if (existingRoomOptional.isPresent()) {
            Room existingRoom = existingRoomOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(existingRoom);
            } catch (Exception e) {
                System.err.println("Failed to convert old Room to JSON: " + e.getMessage());
            }

            // Update fields from DTO to existing entity
            GuestHouse guestHouse = guestHouseRepository.findById(roomDTO.getGuestHouseId())
                    .orElseThrow(() -> new RuntimeException("GuestHouse not found with ID: " + roomDTO.getGuestHouseId()));
            existingRoom.setGuestHouse(guestHouse); // Update GuestHouse association if changed
            existingRoom.setRoomNumber(roomDTO.getRoomNumber());
            existingRoom.setDescription(roomDTO.getDescription());

            Room updatedRoom = roomRepository.save(existingRoom); // After save, lastModifiedBy is set

            // --- Audit Log: UPDATE ---
            try {
                auditLogService.logAudit(
                        "Room",
                        updatedRoom.getId(),
                        "UPDATE",
                        updatedRoom.getLastModifiedBy(),
                        oldValue,
                        objectMapper.writeValueAsString(updatedRoom), 
                        "Room updated for GuestHouse ID: " + updatedRoom.getGuestHouse().getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to log audit for Room update: " + e.getMessage());
            }
            // --- End Audit Log ---

            return Optional.of(convertToDTO(updatedRoom));
        }
        return Optional.empty();
    }

    public boolean deleteRoom(Long id) {
        Optional<Room> roomToDeleteOptional = roomRepository.findById(id);
        if (roomToDeleteOptional.isPresent()) {
            Room roomToDelete = roomToDeleteOptional.get();

            String oldValue = null;
            try {
                oldValue = objectMapper.writeValueAsString(roomToDelete);
            } catch (Exception e) {
                System.err.println("Failed to convert old Room to JSON for delete: " + e.getMessage());
            }

            roomRepository.deleteById(id);

            // --- Audit Log: DELETE ---
            auditLogService.logAudit(
                    "Room",
                    id,
                    "DELETE",
                    roomToDelete.getCreatedBy(),
                    oldValue,
                    null,
                    "Room deleted. Was for GuestHouse ID: " + roomToDelete.getGuestHouse().getId()
            );
            // --- End Audit Log ---
            return true;
        }
        return false;
    }
}


