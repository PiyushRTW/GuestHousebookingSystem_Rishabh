package com.Application.GuestHouseBooking.dtos;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DashboardStatsDTO {
    // Overall Statistics
    private Long totalGuestHouses;
    private Long totalRooms;
    private Long totalBeds;
    private Long occupiedBeds;
    private Long availableBeds;
    
    // Booking Statistics
    private Long totalBookings;
    private Long pendingBookings;
    private Long confirmedBookings;
    private Long completedBookings;
    private Long cancelledBookings;
    
    // Period Report Statistics
    private BigDecimal totalRevenue;
    private Long totalGuestVisits;
    private Long totalCheckIns;
    private Long totalNightsCompleted;
    private Long averageStayDuration;
    private BigDecimal averageBookingValue;
} 