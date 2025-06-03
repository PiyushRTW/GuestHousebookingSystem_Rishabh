package com.Application.GuestHouseBooking.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;
import com.Application.GuestHouseBooking.service.GuestHouseServices;

@RestController
@RequestMapping("/api/guesthouses")
public class GuestHouseController {

    @Autowired
    private GuestHouseServices guestHouseService;

    @PostMapping
    public ResponseEntity<GuestHouseDTO> createGuestHouse(@RequestBody GuestHouseDTO guestHouseDTO) {
        GuestHouseDTO createdGuestHouse = guestHouseService.createGuestHouse(guestHouseDTO);
        return new ResponseEntity<>(createdGuestHouse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuestHouseDTO> getGuestHouseById(@PathVariable Long id) {
        Optional<GuestHouseDTO> guestHouseDTO = guestHouseService.getGuestHouseById(id);
        return guestHouseDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<GuestHouseDTO>> getAllGuestHouses() {
        try {
            List<GuestHouseDTO> guestHouses = guestHouseService.getAllGuestHouses();
            System.out.println("Successfully fetched " + guestHouses.size() + " guest houses");
            return new ResponseEntity<>(guestHouses, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching guest houses: " + e.getMessage());
            e.printStackTrace(); // Print stack trace for debugging
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuestHouseDTO> updateGuestHouse(@PathVariable Long id, @RequestBody GuestHouseDTO guestHouseDTO) {
        Optional<GuestHouseDTO> updatedGuestHouseDTO = guestHouseService.updateGuestHouse(id, guestHouseDTO);
        return updatedGuestHouseDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuestHouse(@PathVariable Long id) {
        if (guestHouseService.deleteGuestHouse(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
