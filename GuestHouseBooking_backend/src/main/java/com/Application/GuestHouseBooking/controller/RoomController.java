package com.Application.GuestHouseBooking.controller;

import com.Application.GuestHouseBooking.dtos.RoomDTO;
import com.Application.GuestHouseBooking.service.implementations.RoomServiceImplementations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")

public class RoomController {
    @Autowired
    private RoomServiceImplementations roomService;

    @PostMapping
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO roomDTO) {
        try {
            RoomDTO createdRoom = roomService.createRoom(roomDTO);
            return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating room: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // GuestHouse not found or invalid data
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long id) {
        Optional<RoomDTO> roomDTO = roomService.getRoomById(id);
        return roomDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<RoomDTO>> getAllRooms() {
        List<RoomDTO> rooms = roomService.getAllRooms();
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @GetMapping("/by-guesthouse/{guestHouseId}")
    public ResponseEntity<List<RoomDTO>> getRoomsByGuestHouseId(@PathVariable Long guestHouseId) {
        List<RoomDTO> rooms = roomService.getRoomsByGuestHouseId(guestHouseId);
        if (rooms.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(rooms, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long id, @RequestBody RoomDTO roomDTO) {
        try {
            Optional<RoomDTO> updatedRoomDTO = roomService.updateRoom(id, roomDTO);
            return updatedRoomDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating room: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        if (roomService.deleteRoom(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
