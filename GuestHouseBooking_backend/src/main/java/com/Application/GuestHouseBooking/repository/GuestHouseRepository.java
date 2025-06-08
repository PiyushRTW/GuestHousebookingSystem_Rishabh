package com.Application.GuestHouseBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.Application.GuestHouseBooking.entity.GuestHouse;

@Repository
public interface GuestHouseRepository extends JpaRepository<GuestHouse, Long> {
    @Query("SELECT DISTINCT gh FROM GuestHouse gh LEFT JOIN FETCH gh.rooms r WHERE gh.id = ?1")
    GuestHouse findByIdWithRooms(Long id);

    @Query("SELECT DISTINCT gh FROM GuestHouse gh LEFT JOIN FETCH gh.rooms")
    List<GuestHouse> findAllWithRooms();

    @Query("SELECT gh FROM GuestHouse gh WHERE EXISTS (SELECT r FROM Room r WHERE r.guestHouse = gh AND EXISTS (SELECT b FROM Bed b WHERE b.room = r AND b.isAvailableForBooking = true))")
    List<GuestHouse> findAllWithAvailableBeds();
}
