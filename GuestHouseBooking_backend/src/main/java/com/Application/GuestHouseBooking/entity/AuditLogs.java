package com.Application.GuestHouseBooking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Data
@NoArgsConstructor // Lombok annotation for no-args constructor
@AllArgsConstructor // Lombok annotation for all-args constructor
public class AuditLogs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String entityName; // e.g., "GuestHouse", "Room", "User", "Booking"

    @Column(nullable = false)
    private Long entityId; // The ID of the entity that was changed

    @Column(nullable = false)
    private String operationType; // e.g., "CREATE", "UPDATE", "DELETE"

    @Column(nullable = false)
    private String changedBy; // The user who performed the operation (e.g., username)

    @CreationTimestamp // Automatically sets the timestamp on creation
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @Column(columnDefinition = "TEXT")
    private String oldValue; // JSON representation of the entity before change (for UPDATE/DELETE)

    @Column(columnDefinition = "TEXT")
    private String newValue; // JSON representation of the entity after change (for CREATE/UPDATE)

    private String remarks; // Any additional notes about the change
}
