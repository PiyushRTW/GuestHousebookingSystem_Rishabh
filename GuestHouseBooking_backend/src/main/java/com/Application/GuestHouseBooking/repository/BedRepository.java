package com.Application.GuestHouseBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.Bed;

@Repository
public interface BedRepository extends JpaRepository<Bed, Long> {
    List<Bed> findByRoomId(Long roomId);
    
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = false")
    Long countOccupiedBeds();
    
    @Query("SELECT COUNT(b) FROM Bed b WHERE b.isAvailableForBooking = true")
    Long countAvailableBeds();
}