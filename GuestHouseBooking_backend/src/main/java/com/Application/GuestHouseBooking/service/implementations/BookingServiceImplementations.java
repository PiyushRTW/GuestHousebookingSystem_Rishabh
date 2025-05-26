package com.Application.GuestHouseBooking.service.implementations;

import com.Application.GuestHouseBooking.dtos.BookingDTO;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.entity.Room;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.BookingServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BookingServiceImplementations implements BookingServices {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // *** MODIFICATION HERE: Use BedRepository instead of RoomRepository for direct booking link ***
    @Autowired
    private BedRepository bedRepository;

    // Helper for converting Entity to DTO
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setBedId(booking.getBed().getId()); // Get ID from associated Bed
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setNumberOfGuests(booking.getNumberOfGuests());
        dto.setStatus(booking.getStatus());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setSpecialRequests(booking.getSpecialRequests());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        return dto;
    }

    // Helper for converting DTO to Entity
    private Booking convertToEntity(BookingDTO bookingDTO) {
        Booking booking = new Booking();
        booking.setId(bookingDTO.getId()); // Set ID for updates, null for creation

        // Fetch User and Bed entities
        User user = userRepository.findById(bookingDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + bookingDTO.getUserId()));
        Bed bed = bedRepository.findById(bookingDTO.getBedId()) // Fetch Bed
                .orElseThrow(() -> new RuntimeException("Bed not found with ID: " + bookingDTO.getBedId()));

        booking.setUser(user);
        booking.setBed(bed); // Set the Bed
        booking.setCheckInDate(bookingDTO.getCheckInDate());
        booking.setCheckOutDate(bookingDTO.getCheckOutDate());
        booking.setNumberOfGuests(bookingDTO.getNumberOfGuests());
        booking.setStatus(bookingDTO.getStatus() != null ? bookingDTO.getStatus() : Booking.BookingStatus.PENDING); // Default status
        booking.setSpecialRequests(bookingDTO.getSpecialRequests());

        // Calculate total price: assuming Bed gets its price from its associated Room
        Room room = bed.getRoom(); // Access the Room through the Bed
        if (room == null) {
            throw new RuntimeException("Bed is not associated with a Room, cannot calculate price.");
        }
        long numberOfNights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (numberOfNights <= 0) {
            throw new RuntimeException("Check-out date must be after check-in date.");
        }
        BigDecimal calculatedPrice = room.getBasePrice().multiply(BigDecimal.valueOf(numberOfNights));
        booking.setTotalPrice(calculatedPrice);

        return booking;
    }

    // --- CRUD Operations ---

    public BookingDTO createBooking(BookingDTO bookingDTO) {
        // Basic business logic validation (more extensive validation in a real app)
        if (bookingDTO.getCheckInDate().isAfter(bookingDTO.getCheckOutDate())) {
            throw new RuntimeException("Check-in date cannot be after check-out date.");
        }
        if (bookingDTO.getNumberOfGuests() <= 0) {
            throw new RuntimeException("Number of guests must be positive.");
        }
        if (bookingDTO.getNumberOfGuests() > 1) { // Assuming one booking is for a single bed, implies 1 guest
            throw new RuntimeException("This booking type supports only 1 guest per bed.");
        }


        // Check bed capacity (basic example - assuming 1 guest per bed)
        Bed bed = bedRepository.findById(bookingDTO.getBedId())
                .orElseThrow(() -> new RuntimeException("Bed not found for booking: " + bookingDTO.getBedId()));
        // Note: 'count' in Bed is number of beds of that type. If booking is for ONE bed, then check capacity of that specific bed.
        // For simplicity now, let's just assume one "Bed" entity instance equals one bookable slot.
        // More complex logic would involve checking if a bed with count > 1 still has slots.

        // Check for overlapping bookings for the SPECIFIC BED
        List<Booking> overlappingBookings = bookingRepository.findByBedIdAndCheckOutDateAfterAndCheckInDateBefore(
                bookingDTO.getBedId(), bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Bed is not available for the selected dates.");
        }

        Booking booking = convertToEntity(bookingDTO);
        Booking savedBooking = bookingRepository.save(booking);
        return convertToDTO(savedBooking);
    }

    public Optional<BookingDTO> getBookingById(Long id) {
        return bookingRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // *** MODIFICATION HERE: Get bookings by Bed ID ***
    public List<BookingDTO> getBookingsByBedId(Long bedId) {
        return bookingRepository.findByBedId(bedId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<BookingDTO> updateBooking(Long id, BookingDTO bookingDTO) {
        Optional<Booking> existingBookingOptional = bookingRepository.findById(id);
        if (existingBookingOptional.isPresent()) {
            Booking existingBooking = existingBookingOptional.get();

            // Fetch User and Bed (always ensure they exist on update as well)
            User user = userRepository.findById(bookingDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + bookingDTO.getUserId()));
            Bed bed = bedRepository.findById(bookingDTO.getBedId())
                    .orElseThrow(() -> new RuntimeException("Bed not found with ID: " + bookingDTO.getBedId()));

            existingBooking.setUser(user);
            existingBooking.setBed(bed); // Set the Bed
            existingBooking.setCheckInDate(bookingDTO.getCheckInDate());
            existingBooking.setCheckOutDate(bookingDTO.getCheckOutDate());
            existingBooking.setNumberOfGuests(bookingDTO.getNumberOfGuests());
            existingBooking.setStatus(bookingDTO.getStatus());
            existingBooking.setSpecialRequests(bookingDTO.getSpecialRequests());

            // Recalculate price if dates or bed changed
            Room room = bed.getRoom(); // Access the Room through the Bed
            if (room == null) {
                throw new RuntimeException("Bed is not associated with a Room, cannot calculate price.");
            }
            long numberOfNights = ChronoUnit.DAYS.between(existingBooking.getCheckInDate(), existingBooking.getCheckOutDate());
            BigDecimal calculatedPrice = room.getBasePrice().multiply(BigDecimal.valueOf(numberOfNights));
            existingBooking.setTotalPrice(calculatedPrice);

            Booking updatedBooking = bookingRepository.save(existingBooking);
            return Optional.of(convertToDTO(updatedBooking));
        }
        return Optional.empty();
    }

    public boolean deleteBooking(Long id) {
        if (bookingRepository.existsById(id)) {
            bookingRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
