package com.Application.GuestHouseBooking.service.implementations;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.BedDTO;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.service.BedServices;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BedServicesImplementations implements BedServices {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private RoomRepository roomRepository; // To fetch associated Room

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private AuditLogServices auditLogService; // <<< Inject AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // <<< Inject ObjectMapper

    private BedDTO convertToDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setRoomId(bed.getRoom().getId());
        dto.setBedNumber(bed.getBedNumber());
        dto.setIsAvailable(bed.getIsAvailable());
        dto.setIsAvailableForBooking(bed.getIsAvailableForBooking());
        dto.setPricePerNight(bed.getPricePerNight());
        dto.setCreatedAt(bed.getCreatedAt());
        dto.setUpdatedAt(bed.getUpdatedAt());
        dto.setCreatedBy(bed.getCreatedBy());
        dto.setLastModifiedBy(bed.getLastModifiedBy());
        return dto;
    }

    private Bed convertToEntity(BedDTO bedDTO) {
        Bed bed = new Bed();
        bed.setId(bedDTO.getId());
        bed.setBedNumber(bedDTO.getBedNumber());
        bed.setIsAvailable(bedDTO.getIsAvailable());
        bed.setIsAvailableForBooking(bedDTO.getIsAvailableForBooking());
        bed.setPricePerNight(bedDTO.getPricePerNight());

        // Set the room
        Room room = roomRepository.findById(bedDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + bedDTO.getRoomId()));
        bed.setRoom(room);

        // Set audit fields if provided
        if (bedDTO.getCreatedBy() != null) {
            bed.setCreatedBy(bedDTO.getCreatedBy());
        }
        if (bedDTO.getLastModifiedBy() != null) {
            bed.setLastModifiedBy(bedDTO.getLastModifiedBy());
        }

        return bed;
    }

    public BedDTO createBed(BedDTO bedDTO) {
        Bed bed = convertToEntity(bedDTO);
        Bed savedBed = bedRepository.save(bed);

        // --- Audit Log: CREATE ---
        try {
            auditLogService.logAudit(
                    "Bed",
                    savedBed.getId(),
                    "CREATE",
                    savedBed.getCreatedBy(),
                    null,
                    objectMapper.writeValueAsString(savedBed),
                    "New Bed created for Room ID: " + savedBed.getRoom().getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for Bed creation: " + e.getMessage());
        }

        return convertToDTO(savedBed);
    }

    public Optional<BedDTO> getBedById(Long id) {
        return bedRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<BedDTO> getAllBeds() {
        return bedRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BedDTO> getBedsByRoomId(Long roomId) {
        return bedRepository.findByRoomId(roomId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BedDTO> updateBed(Long id, BedDTO bedDTO) {
        Optional<Bed> existingBedOptional = bedRepository.findById(id);
        if (existingBedOptional.isPresent()) {
            Bed existingBed = existingBedOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(existingBed);
            } catch (Exception e) {
                System.err.println("Failed to convert old Bed to JSON: " + e.getMessage());
            }

            Room room = roomRepository.findById(bedDTO.getRoomId())
                    .orElseThrow(() -> new RuntimeException("Room not found with ID: " + bedDTO.getRoomId()));
            existingBed.setRoom(room); // Update Room association if changed

            Bed updatedBed = bedRepository.save(existingBed); // After save, lastModifiedBy is set

            // --- Audit Log: UPDATE ---
            try {
                auditLogService.logAudit(
                        "Bed",
                        updatedBed.getId(),
                        "UPDATE",
                        updatedBed.getLastModifiedBy(), // Will be populated by Spring Data JPA Auditing
                        oldValue,
                        objectMapper.writeValueAsString(updatedBed), // New value as JSON
                        "Bed updated for Room ID: " + updatedBed.getRoom().getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to log audit for Bed update: " + e.getMessage());
            }
            // --- End Audit Log ---

            return Optional.of(convertToDTO(updatedBed));
        }
        return Optional.empty();
    }

    public boolean deleteBed(Long id) {
        Optional<Bed> bedToDeleteOptional = bedRepository.findById(id);
        if (bedToDeleteOptional.isPresent()) {
            Bed bedToDelete = bedToDeleteOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(bedToDelete);
            } catch (Exception e) {
                System.err.println("Failed to convert old Bed to JSON for delete: " + e.getMessage());
            }

            bedRepository.deleteById(id);

            // --- Audit Log: DELETE ---
            auditLogService.logAudit(
                    "Bed",
                    id,
                    "DELETE",
                    bedToDelete.getCreatedBy(), // Using createdBy as a fallback; ideally, get current user from security context for deletion
                    oldValue,
                    null, // No new value for delete
                    "Bed deleted. Was for Room ID: " + bedToDelete.getRoom().getId()
            );
            // --- End Audit Log ---
            return true;
        }
        return false;
    }

    @Override
    public List<BedDTO> getAvailableBeds(Long roomId, LocalDate checkIn, LocalDate checkOut) {
        List<Bed> allBedsInRoom = bedRepository.findByRoomId(roomId);
        
        return allBedsInRoom.stream()
            .filter(bed -> bed.getIsAvailable()) // First check if bed is generally available
            .filter(bed -> !bookingRepository.existsByBedIdAndDateRange(bed.getId(), checkIn, checkOut))
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
}

