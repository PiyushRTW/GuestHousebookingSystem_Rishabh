package com.Application.GuestHouseBooking.dtos;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RoomDTO {
    private Long id;
    private Long guestHouseId; // To link to the GuestHouse
    private String roomNumber;
    private String roomType;
    private Integer capacity;
    private BigDecimal pricePerNight;
    private String description;
    private String amenities;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}