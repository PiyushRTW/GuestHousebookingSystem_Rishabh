package com.Application.GuestHouseBooking.dtos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BedDTO {
    private Long id;
    private Long roomId; // To link to the Room
    private String bedNumber;
    private Boolean isAvailable;
    private BigDecimal pricePerNight;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
