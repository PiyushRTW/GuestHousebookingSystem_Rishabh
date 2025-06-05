package com.Application.GuestHouseBooking.Authentication;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor // Generates a constructor with all fields
@NoArgsConstructor  // Generates a no-argument constructor (useful for deserialization)
public class AuthResponse {
    private String jwt;
}