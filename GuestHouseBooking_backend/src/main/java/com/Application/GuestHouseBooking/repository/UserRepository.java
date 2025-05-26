package com.Application.GuestHouseBooking.repository;

import com.Application.GuestHouseBooking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username); // Useful for checking unique usernames
    boolean existsByEmail(String email);      // Useful for checking unique emails
}
