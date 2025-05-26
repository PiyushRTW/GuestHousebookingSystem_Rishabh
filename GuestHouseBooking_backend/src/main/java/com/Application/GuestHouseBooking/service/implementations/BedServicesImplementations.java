package com.Application.GuestHouseBooking.service.implementations;

import com.Application.GuestHouseBooking.dtos.BedDTO;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.service.BedServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BedServicesImplementations implements BedServices {

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private RoomRepository roomRepository; // To fetch associated Room

    private BedDTO convertToDTO(Bed bed) {
        BedDTO dto = new BedDTO();
        dto.setId(bed.getId());
        dto.setRoomId(bed.getRoom().getId()); // Get ID from associated Room
        // Removed: dto.setBedType(bed.getBedType());
        // Removed: dto.setCount(bed.getCount());
        dto.setCreatedAt(bed.getCreatedAt());
        dto.setUpdatedAt(bed.getUpdatedAt());
        return dto;
    }

    private Bed convertToEntity(BedDTO bedDTO) {
        Bed bed = new Bed();
        bed.setId(bedDTO.getId());

        // Fetch the associated Room
        Room room = roomRepository.findById(bedDTO.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + bedDTO.getRoomId()));
        bed.setRoom(room);

        // Removed: bed.setBedType(bedDTO.getBedType());
        // Removed: bed.setCount(bedDTO.getCount());
        return bed;
    }
    // --- CRUD Operations ---

    public BedDTO createBed(BedDTO bedDTO) {
        Bed bed = convertToEntity(bedDTO);
        Bed savedBed = bedRepository.save(bed);
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
        Optional<Bed> existingBed = bedRepository.findById(id);
        if (existingBed.isPresent()) {
            Bed bedToUpdate = convertToEntity(bedDTO);
            bedToUpdate.setId(id); // Ensure the ID is set for updating
            Bed updatedBed = bedRepository.save(bedToUpdate);
            return Optional.of(convertToDTO(updatedBed));
        }
        return Optional.empty();
    }

    public boolean deleteBed(Long id) {
        if (bedRepository.existsById(id)) {
            bedRepository.deleteById(id);
            return true;
        }
        return false;
    }

}
