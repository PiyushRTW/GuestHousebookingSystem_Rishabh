package com.Application.GuestHouseBooking.service;

import com.Application.GuestHouseBooking.dtos.GuestHouseDTO;

import java.util.List;
import java.util.Optional;

public interface GuestHouseServices {
    GuestHouseDTO createGuestHouse(GuestHouseDTO guestHouseDTO);
    Optional<GuestHouseDTO> getGuestHouseById(Long id);
    List<GuestHouseDTO> getAllGuestHouses();
    Optional<GuestHouseDTO> updateGuestHouse(Long id, GuestHouseDTO guestHouseDTO);
    boolean deleteGuestHouse(Long id);
}
