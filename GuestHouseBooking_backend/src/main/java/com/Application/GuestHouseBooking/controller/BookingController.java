package com.Application.GuestHouseBooking.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.dtos.BookingDTO;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;
import com.Application.GuestHouseBooking.service.implementations.BookingServiceImplementations;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {
    @Autowired
    private BookingServiceImplementations bookingService;

    @PostMapping
    public ResponseEntity<BookingDTO> createBooking(@RequestBody BookingDTO bookingDTO) {
        try {
            BookingDTO createdBooking = bookingService.createBooking(bookingDTO);
            return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            System.err.println("Error creating booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBookingById(@PathVariable Long id) {
        Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
        return bookingDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<BookingDTO>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        List<BookingDTO> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatus(status);
        } else {
            bookings = bookingService.getAllBookings();
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByUserId(
            @PathVariable Long userId,
            @RequestParam(required = false) BookingStatus status) {
        List<BookingDTO> bookings;
        if (status != null) {
            bookings = bookingService.getBookingsByStatusAndUserId(status, userId);
        } else {
            bookings = bookingService.getBookingsByUserId(userId);
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/by-bed/{bedId}")
    public ResponseEntity<List<BookingDTO>> getBookingsByBedId(@PathVariable Long bedId) {
        List<BookingDTO> bookings = bookingService.getBookingsByBedId(bedId);
        if (bookings.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @GetMapping("/active")
    public ResponseEntity<List<BookingDTO>> getActiveBookings() {
        List<BookingDTO> bookings = bookingService.getActiveBookings();
        return new ResponseEntity<>(bookings, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookingDTO> updateBooking(@PathVariable Long id, @RequestBody BookingDTO bookingDTO) {
        try {
            Optional<BookingDTO> updatedBookingDTO = bookingService.updateBooking(id, bookingDTO);
            return updatedBookingDTO.map(dto -> new ResponseEntity<>(dto, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (RuntimeException e) {
            System.err.println("Error updating booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBooking(@PathVariable Long id) {
        if (bookingService.deleteBooking(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id) {
        try {
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            if (bookingDTO.isPresent()) {
                BookingDTO dto = bookingDTO.get();
                dto.setStatus(BookingStatus.CANCELED);
                return bookingService.updateBooking(id, dto)
                    .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error cancelling booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<BookingDTO> completeBooking(@PathVariable Long id) {
        try {
            Optional<BookingDTO> bookingDTO = bookingService.getBookingById(id);
            if (bookingDTO.isPresent()) {
                BookingDTO dto = bookingDTO.get();
                dto.setStatus(BookingStatus.COMPLETED);
                return bookingService.updateBooking(id, dto)
                    .map(updated -> new ResponseEntity<>(updated, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            System.err.println("Error completing booking: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
