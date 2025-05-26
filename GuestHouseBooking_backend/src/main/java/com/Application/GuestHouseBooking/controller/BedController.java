package com.Application.GuestHouseBooking.controller;

import com.Application.GuestHouseBooking.dtos.BedDTO;
import com.Application.GuestHouseBooking.service.implementations.BedServicesImplementations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/beds")
public class BedController {

    @Autowired
    private BedServicesImplementations bedService;

    @PostMapping
    public ResponseEntity<BedDTO> createBed(@RequestBody BedDTO bedDTO) {
        try {
            BedDTO createdBed = bedService.createBed(bedDTO);
            return new ResponseEntity<>(createdBed, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating bed: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Room not found or invalid data
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        Optional<BedDTO> bedDTO = bedService.getBedById(id);
        return bedDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<BedDTO>> getAllBeds() {
        List<BedDTO> beds = bedService.getAllBeds();
        return new ResponseEntity<>(beds, HttpStatus.OK);
    }

    @GetMapping("/by-room/{roomId}")
    public ResponseEntity<List<BedDTO>> getBedsByRoomId(@PathVariable Long roomId) {
        List<BedDTO> beds = bedService.getBedsByRoomId(roomId);
        if (beds.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // If room doesn't exist or no beds
        }
        return new ResponseEntity<>(beds, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BedDTO> updateBed(@PathVariable Long id, @RequestBody BedDTO bedDTO) {
        try {
            Optional<BedDTO> updatedBedDTO = bedService.updateBed(id, bedDTO);
            return updatedBedDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating bed: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Room not found or invalid data
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBed(@PathVariable Long id) {
        if (bedService.deleteBed(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
