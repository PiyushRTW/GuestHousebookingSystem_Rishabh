package com.Application.GuestHouseBooking.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "guest_house")
@Data
@EntityListeners(AuditingEntityListener.class)

public class GuestHouse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String country;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String amenities;

    private String contactNumber;

    private String email;

    private String imageUrl;

    @OneToMany(mappedBy = "guestHouse", cascade = CascadeType.ALL, orphanRemoval = true)
    // 'mappedBy' indicates the field in the 'Room' entity that owns the relationship.
    // 'cascade = CascadeType.ALL' means operations like persist, merge, remove will cascade to associated rooms.
    // 'orphanRemoval = true' ensures that if a Room is removed from this collection, it's also deleted from the DB.
    private Set<Room> rooms = new HashSet<>();

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