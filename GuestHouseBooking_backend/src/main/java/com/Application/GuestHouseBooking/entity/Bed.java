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
import lombok.Data;

@Entity
@Table(name = "bed")
@Data
@EntityListeners(AuditingEntityListener.class)
public class Bed {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private String bedNumber;

    @Column(nullable = false)
    private Boolean isAvailable;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // --- Auditing fields (Added for Spring Data JPA Auditing) ---
    @CreatedBy // Automatically filled by AuditorAware
    @Column(nullable = false, updatable = false)
    private String createdBy;

    @LastModifiedBy // Automatically filled by AuditorAware on update
    @Column(nullable = false)
    private String lastModifiedBy;
    // --- End of Auditing fields ---
}
