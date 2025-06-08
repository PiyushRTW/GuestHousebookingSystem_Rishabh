package com.Application.GuestHouseBooking.service.implementations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.Application.GuestHouseBooking.dtos.DashboardStatsDTO;
import com.Application.GuestHouseBooking.repository.BookingRepository;
import com.Application.GuestHouseBooking.repository.GuestHouseRepository;
import com.Application.GuestHouseBooking.repository.RoomRepository;
import com.Application.GuestHouseBooking.repository.BedRepository;
import com.Application.GuestHouseBooking.service.DashboardService;
import com.Application.GuestHouseBooking.entity.Booking.BookingStatus;

@Service
public class DashboardServiceImplementation implements DashboardService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private GuestHouseRepository guestHouseRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private BedRepository bedRepository;

    @Override
    public DashboardStatsDTO getOverallStatistics() {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Get counts from repositories using JPQL queries
        stats.setTotalGuestHouses(guestHouseRepository.count());
        stats.setTotalRooms(roomRepository.count());
        stats.setTotalBeds(bedRepository.count());
        stats.setOccupiedBeds(bedRepository.countOccupiedBeds());
        stats.setAvailableBeds(bedRepository.countAvailableBeds());

        // Get booking statistics
        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.setConfirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED));
        stats.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        stats.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELED));

        return stats;
    }

    @Override
    public DashboardStatsDTO getPeriodReport(LocalDate startDate, LocalDate endDate) {
        DashboardStatsDTO stats = new DashboardStatsDTO();

        // Get period-specific statistics using repository methods
        stats.setTotalRevenue(bookingRepository.calculateTotalRevenue(startDate, endDate));
        stats.setTotalGuestVisits(bookingRepository.countGuestVisits(startDate, endDate));
        stats.setTotalCheckIns(bookingRepository.countCheckIns(startDate, endDate));
        stats.setTotalNightsCompleted(bookingRepository.calculateTotalNights(startDate, endDate));
        
        // Calculate averages
        Long totalBookings = bookingRepository.countBookingsInPeriod(startDate, endDate);
        if (totalBookings > 0) {
            BigDecimal totalRev = bookingRepository.calculateTotalRevenue(startDate, endDate);
            stats.setAverageBookingValue(totalRev.divide(BigDecimal.valueOf(totalBookings), 2, java.math.RoundingMode.HALF_UP));
            
            Long totalNights = bookingRepository.calculateTotalNights(startDate, endDate);
            stats.setAverageStayDuration(totalNights / totalBookings);
        }

        return stats;
    }
} 