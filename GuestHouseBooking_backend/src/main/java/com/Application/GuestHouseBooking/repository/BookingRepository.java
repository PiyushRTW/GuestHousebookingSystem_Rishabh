package com.Application.GuestHouseBooking.repository;

import com.Application.GuestHouseBooking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    // *** MODIFICATION HERE: Find by Bed ID ***
    List<Booking> findByBedId(Long bedId);

    // Custom query to find existing bookings for a specific BED within a date range
    List<Booking> findByBedIdAndCheckOutDateAfterAndCheckInDateBefore(
            Long bedId, LocalDate checkInDate, LocalDate checkOutDate);
}
