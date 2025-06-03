package com.Application.GuestHouseBooking.dtos;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private Long guestHouseId; // To link to the GuestHouse
    private String roomNumber;
    private String description;
    private String amenities;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}