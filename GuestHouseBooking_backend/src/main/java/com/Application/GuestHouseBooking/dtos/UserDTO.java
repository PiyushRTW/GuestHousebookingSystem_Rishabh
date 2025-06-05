package com.Application.GuestHouseBooking.dtos;

import com.Application.GuestHouseBooking.entity.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private User.UserRole role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
