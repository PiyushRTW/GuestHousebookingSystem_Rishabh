package com.Application.GuestHouseBooking.Authentication;

import lombok.Data;

@Data
public class AuthRequest {
    private String username;
    private String password;
}
