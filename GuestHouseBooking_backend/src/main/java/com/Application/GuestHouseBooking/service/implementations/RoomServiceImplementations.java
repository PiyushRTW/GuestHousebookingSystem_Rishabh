package com.Application.GuestHouseBooking.service.implementations;

import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.entity.GuestHouse;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.service.RoomServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RoomServiceImplementations implements RoomServices {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private GuestHouseRepository guestHouseRepository; // To fetch associated GuestHouse

    private RoomDTO convertToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setId(room.getId());
        dto.setGuestHouseId(room.getGuestHouse().getId()); // Get ID from associated GuestHouse
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomType(room.getRoomType());
        dto.setCapacity(room.getCapacity());
        dto.setPricePerNight(room.getBasePrice());
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
        room.setRoomType(roomDTO.getRoomType());
        room.setCapacity(roomDTO.getCapacity());
        room.setBasePrice(roomDTO.getPricePerNight());
        room.setDescription(roomDTO.getDescription());
        room.setAmenities(roomDTO.getAmenities());
        room.setImageUrl(roomDTO.getImageUrl());
        return room;
    }

    // --- CRUD Operations ---

    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = convertToEntity(roomDTO);
        Room savedRoom = roomRepository.save(room);
        return convertToDTO(savedRoom);
    }

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
        Optional<Room> existingRoom = roomRepository.findById(id);
        if (existingRoom.isPresent()) {
            Room roomToUpdate = convertToEntity(roomDTO);
            roomToUpdate.setId(id); // Ensure the ID is set for updating
            Room updatedRoom = roomRepository.save(roomToUpdate);
            return Optional.of(convertToDTO(updatedRoom));
        }
        return Optional.empty();
    }

    public boolean deleteRoom(Long id) {
        if (roomRepository.existsById(id)) {
            roomRepository.deleteById(id);
            return true;
        }
        return false;
    }
}


