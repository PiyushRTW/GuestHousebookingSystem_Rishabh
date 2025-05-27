package com.Application.GuestHouseBooking.service;

import com.Application.GuestHouseBooking.dtos.BedDTO;

import java.util.List;
import java.util.Optional;

public interface BedServices {
    BedDTO createBed(BedDTO bedDTO);
    Optional<BedDTO> getBedById(Long id);
    List<BedDTO> getAllBeds();
    List<BedDTO> getBedsByRoomId(Long roomId);
    Optional<BedDTO> updateBed(Long id, BedDTO bedDTO);
    boolean deleteBed(Long id);

}
