package com.Application.GuestHouseBooking.dtos;

import com.Application.GuestHouseBooking.entity.Booking;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class BookingDTO {
    private Long id;
    private Long userId;
    // *** MODIFICATION HERE: Link to Bed ID ***
    private Long bedId; // ID of the specific bed being booked
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private Booking.BookingStatus status;
    private BigDecimal totalPrice;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
