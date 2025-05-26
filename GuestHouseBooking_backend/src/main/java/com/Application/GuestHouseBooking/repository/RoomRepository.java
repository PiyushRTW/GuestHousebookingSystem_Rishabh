package com.Application.GuestHouseBooking.repository;

import com.Application.GuestHouseBooking.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByGuestHouseId(Long guestHouseId);

    // Custom query to find a specific room by its number within a guest house
    Optional<Room> findByGuestHouseIdAndRoomNumber(Long guestHouseId, String roomNumber);
}
