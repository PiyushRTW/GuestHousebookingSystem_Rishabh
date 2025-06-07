package com.Application.GuestHouseBooking.entity;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "bed")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Room is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @NotBlank(message = "Bed number is required")
    @Column(nullable = false, unique = true)
    private String bedNumber;

    @NotNull(message = "Availability status is required")
    @Column(nullable = false)
    private Boolean isAvailable = true;  // Default to true

    @NotNull(message = "Price per night is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by is required")
    @CreatedBy
    @Column(nullable = false, updatable = false)
    private String createdBy;

    @NotBlank(message = "Last modified by is required")
    @LastModifiedBy
    @Column(nullable = false)
    private String lastModifiedBy;

    // Helper method to check if bed is available for booking
    public boolean isAvailableForBooking() {
        return isAvailable != null && isAvailable;
    }

    // Helper method to mark bed as booked
    public void markAsBooked() {
        this.isAvailable = false;
    }

    // Helper method to mark bed as available
    public void markAsAvailable() {
        this.isAvailable = true;
    }
}
