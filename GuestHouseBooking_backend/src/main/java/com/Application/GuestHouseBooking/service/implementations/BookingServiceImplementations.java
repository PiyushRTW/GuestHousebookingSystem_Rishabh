package com.Application.GuestHouseBooking.service.implementations;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.MailServices.MailService;
import com.Application.GuestHouseBooking.dtos.BookingDTO;
import com.Application.GuestHouseBooking.entity.Bed;
import com.Application.GuestHouseBooking.entity.Booking;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.BookingServices;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class BookingServiceImplementations implements BookingServices {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BedRepository bedRepository;

    @Autowired
    private AuditLogServices auditLogService; // <<< Inject AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // <<< Inject ObjectMapper

    @Autowired
    private MailService mailService;

    // Helper for converting Entity to DTO
    private BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUser().getId());
        dto.setBedId(booking.getBed().getId());
        dto.setRoomId(booking.getBed().getRoom().getId());
        dto.setGuestHouseId(booking.getBed().getRoom().getGuestHouse().getId());
        dto.setCheckInDate(booking.getCheckInDate());
        dto.setCheckOutDate(booking.getCheckOutDate());
        dto.setStatus(booking.getStatus());
        dto.setTotalPrice(booking.getTotalPrice());
        dto.setPurpose(booking.getPurpose());
        dto.setCreatedAt(booking.getCreatedAt());
        dto.setUpdatedAt(booking.getUpdatedAt());
        dto.setCreatedBy(booking.getCreatedBy());
        dto.setLastModifiedBy(booking.getLastModifiedBy());
        
        // Set additional display fields
        dto.setUserName(booking.getUser().getFirstName() + " " + booking.getUser().getLastName());
        dto.setBedNumber(booking.getBed().getBedNumber());
        dto.setRoomNumber(booking.getBed().getRoom().getRoomNumber());
        dto.setGuestHouseName(booking.getBed().getRoom().getGuestHouse().getName());
        
        // Set guest information fields
        dto.setFirstName(booking.getFirstName());
        dto.setLastName(booking.getLastName());
        dto.setEmail(booking.getEmail());
        dto.setPhoneNumber(booking.getPhoneNumber());
        dto.setGender(booking.getGender());
        dto.setAddress(booking.getAddress());
        
        return dto;
    }

    // Helper for converting DTO to Entity
    private Booking convertToEntity(BookingDTO bookingDTO) {
        Booking booking = new Booking();
        booking.setId(bookingDTO.getId()); // Set ID for updates, null for creation

        // Fetch User and Bed entities
        User user = userRepository.findById(bookingDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + bookingDTO.getUserId()));
        Bed bed = bedRepository.findById(bookingDTO.getBedId())
                .orElseThrow(() -> new RuntimeException("Bed not found with ID: " + bookingDTO.getBedId()));

        booking.setUser(user);
        booking.setBed(bed);
        booking.setCheckInDate(bookingDTO.getCheckInDate());
        booking.setCheckOutDate(bookingDTO.getCheckOutDate());
        booking.setStatus(bookingDTO.getStatus() != null ? bookingDTO.getStatus() : Booking.BookingStatus.PENDING);
        booking.setPurpose(bookingDTO.getPurpose());
        
        // Set guest information
        booking.setFirstName(bookingDTO.getFirstName());
        booking.setLastName(bookingDTO.getLastName());
        booking.setEmail(bookingDTO.getEmail());
        booking.setPhoneNumber(bookingDTO.getPhoneNumber());
        booking.setGender(bookingDTO.getGender());
        booking.setAddress(bookingDTO.getAddress());

        // Calculate total price based on bed's price per night
        long numberOfNights = ChronoUnit.DAYS.between(booking.getCheckInDate(), booking.getCheckOutDate());
        if (numberOfNights <= 0) {
            throw new RuntimeException("Check-out date must be after check-in date.");
        }
        BigDecimal calculatedPrice = bed.getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
        booking.setTotalPrice(calculatedPrice);

        return booking;
    }

    // --- CRUD Operations ---

    public BookingDTO createBooking(BookingDTO bookingDTO) {
        if (bookingDTO.getCheckInDate().isAfter(bookingDTO.getCheckOutDate())) {
            throw new RuntimeException("Check-in date cannot be after check-out date.");
        }

        Bed bed = bedRepository.findById(bookingDTO.getBedId())
                .orElseThrow(() -> new RuntimeException("Bed not found for booking: " + bookingDTO.getBedId()));

        List<Booking> overlappingBookings = bookingRepository.findByBedIdAndCheckOutDateAfterAndCheckInDateBefore(
                bookingDTO.getBedId(), bookingDTO.getCheckInDate(), bookingDTO.getCheckOutDate());
        if (!overlappingBookings.isEmpty()) {
            throw new RuntimeException("Bed is not available for the selected dates.");
        }

        Booking booking = convertToEntity(bookingDTO);
        Booking savedBooking = bookingRepository.save(booking);

        // --- Audit Log: CREATE ---
        try {
            auditLogService.logAudit(
                    "Booking",
                    savedBooking.getId(),
                    "CREATE",
                    savedBooking.getCreatedBy(),
                    null,
                    objectMapper.writeValueAsString(savedBooking),
                    "New Booking created for User ID: " + savedBooking.getUser().getId() + " on Bed ID: " + savedBooking.getBed().getId()
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for Booking creation: " + e.getMessage());
        }

        // Send notifications
        try {
            // Send admin notification
            mailService.sendBookingNotificationToAdmin(savedBooking);
            
            // If it's an admin booking (status is CONFIRMED), also send guest confirmation
            if (savedBooking.getStatus() == Booking.BookingStatus.CONFIRMED) {
                mailService.sendBookingConfirmationToGuest(savedBooking);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification emails: " + e.getMessage());
        }

        return convertToDTO(savedBooking);
    }

    public Optional<BookingDTO> getBookingById(Long id) {
        return bookingRepository.findByIdWithDetails(id)
                .map(this::convertToDTO);
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAllWithDetails().stream()
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
            Booking.BookingStatus oldStatus = existingBooking.getStatus();

            String oldValue = null;
            try {
                oldValue = objectMapper.writeValueAsString(existingBooking);
            } catch (Exception e) {
                System.err.println("Failed to convert old Booking to JSON: " + e.getMessage());
            }

            // Update booking
            existingBooking.setCheckInDate(bookingDTO.getCheckInDate());
            existingBooking.setCheckOutDate(bookingDTO.getCheckOutDate());
            existingBooking.setStatus(bookingDTO.getStatus());
            existingBooking.setPurpose(bookingDTO.getPurpose());
            existingBooking.setFirstName(bookingDTO.getFirstName());
            existingBooking.setLastName(bookingDTO.getLastName());
            existingBooking.setEmail(bookingDTO.getEmail());
            existingBooking.setPhoneNumber(bookingDTO.getPhoneNumber());
            existingBooking.setGender(bookingDTO.getGender());
            existingBooking.setAddress(bookingDTO.getAddress());

            // Recalculate price if dates changed
            if (!existingBooking.getCheckInDate().equals(bookingDTO.getCheckInDate()) ||
                !existingBooking.getCheckOutDate().equals(bookingDTO.getCheckOutDate())) {
                long numberOfNights = ChronoUnit.DAYS.between(existingBooking.getCheckInDate(), existingBooking.getCheckOutDate());
                if (numberOfNights <= 0) {
                    throw new RuntimeException("Check-out date must be after check-in date.");
                }
                BigDecimal calculatedPrice = existingBooking.getBed().getPricePerNight().multiply(BigDecimal.valueOf(numberOfNights));
                existingBooking.setTotalPrice(calculatedPrice);
            }

            Booking updatedBooking = bookingRepository.save(existingBooking);

            // --- Audit Log: UPDATE ---
            try {
                auditLogService.logAudit(
                        "Booking",
                        updatedBooking.getId(),
                        "UPDATE",
                        updatedBooking.getLastModifiedBy(),
                        oldValue,
                        objectMapper.writeValueAsString(updatedBooking),
                        "Booking updated for User ID: " + updatedBooking.getUser().getId() + " on Bed ID: " + updatedBooking.getBed().getId()
                );
            } catch (Exception e) {
                System.err.println("Failed to log audit for Booking update: " + e.getMessage());
            }

            // Send notifications based on status change
            if (updatedBooking.getStatus() != oldStatus) {
                try {
                    switch (updatedBooking.getStatus()) {
                        case CONFIRMED -> mailService.sendBookingConfirmationToGuest(updatedBooking);
                        case DENIED -> mailService.sendBookingRejectionToGuest(updatedBooking, bookingDTO.getRejectionReason());
                        case CANCELED -> mailService.sendBookingCancellationToGuest(updatedBooking, bookingDTO.getCancellationReason());
                        case COMPLETED -> mailService.sendBookingCompletionToGuest(updatedBooking);
                    }
                } catch (Exception e) {
                    System.err.println("Failed to send status update email: " + e.getMessage());
                }
            }

            return Optional.of(convertToDTO(updatedBooking));
        }
        return Optional.empty();
    }

    public boolean deleteBooking(Long id) {
        Optional<Booking> bookingToDeleteOptional = bookingRepository.findById(id);
        if (bookingToDeleteOptional.isPresent()) {
            Booking bookingToDelete = bookingToDeleteOptional.get();

            String oldValue = null; // Prepare for audit logging
            try {
                oldValue = objectMapper.writeValueAsString(bookingToDelete);
            } catch (Exception e) {
                System.err.println("Failed to convert old Booking to JSON for delete: " + e.getMessage());
            }

            bookingRepository.deleteById(id);

            // --- Audit Log: DELETE ---
            auditLogService.logAudit(
                    "Booking",
                    id,
                    "DELETE",
                    bookingToDelete.getCreatedBy(), // Using createdBy as a fallback; ideally, get current user from security context for deletion
                    oldValue,
                    null, // No new value for delete
                    "Booking deleted for User ID: " + bookingToDelete.getUser().getId() + " on Bed ID: " + bookingToDelete.getBed().getId()
            );
            // --- End Audit Log ---
            return true;
        }
        return false;
    }

    public List<BookingDTO> getBookingsByStatus(Booking.BookingStatus status) {
        return bookingRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByStatusAndUserId(Booking.BookingStatus status, Long userId) {
        return bookingRepository.findByStatusAndUserId(status, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getActiveBookings() {
        return bookingRepository.findAllActiveBookings().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}
