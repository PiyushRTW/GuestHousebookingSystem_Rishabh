package com.Application.GuestHouseBooking.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BedDTO {
    private Long id;
    private Long roomId; // To link to the Room
//    private String bedType;
//    private Integer count; // Number of beds of this type (e.g., 2 single beds in a room)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
