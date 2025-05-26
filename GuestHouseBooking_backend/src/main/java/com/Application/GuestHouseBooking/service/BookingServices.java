package com.Application.GuestHouseBooking.service;

import com.Application.GuestHouseBooking.dtos.BookingDTO;

import java.util.List;
import java.util.Optional;

public interface BookingServices {
    BookingDTO createBooking(BookingDTO bookingDTO);
    Optional<BookingDTO> getBookingById(Long id);
    List<BookingDTO> getAllBookings();
    Optional<BookingDTO> updateBooking(Long id, BookingDTO bookingDTO);
    boolean deleteBooking(Long id);
}
