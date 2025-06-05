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
    private Long bedId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Booking.BookingStatus status;
    private BigDecimal totalPrice;
    private String specialRequests;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
