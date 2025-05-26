package com.Application.GuestHouseBooking.repository;

import com.Application.GuestHouseBooking.entity.GuestHouse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuestHouseRepository extends JpaRepository<GuestHouse, Long> {
}
