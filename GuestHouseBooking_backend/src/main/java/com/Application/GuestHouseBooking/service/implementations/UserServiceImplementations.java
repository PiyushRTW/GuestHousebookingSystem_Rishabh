package com.Application.GuestHouseBooking.service.implementations;

import com.Application.GuestHouseBooking.dtos.UserDTO;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.UserRepository;
import com.Application.GuestHouseBooking.service.UserServices;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserServiceImplementations implements UserServices {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogServices auditLogService; // Inject AuditLogService

    @Autowired
    private ObjectMapper objectMapper; // Inject ObjectMapper for JSON conversion

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        // For security, DO NOT include password when returning DTOs for GET requests
        // dto.setPassword(user.getPassword());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        return dto;
    }

    private User convertToEntity(UserDTO userDTO) {
        User user = new User();
        user.setId(userDTO.getId()); // ID will be null for new users, set for updates
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword()); // In a real app, encode password before saving!
        user.setEmail(userDTO.getEmail());
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        return user;
    }

    // --- CRUD Operations ---

    public UserDTO createUser(UserDTO userDTO) {
        // Basic validation for uniqueness (more robust validation can be added)
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new RuntimeException("Username already exists: " + userDTO.getUsername());
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists: " + userDTO.getEmail());
        }

        User user = convertToEntity(userDTO);
        User savedUser = userRepository.save(user);
        // --- Audit Log: CREATE for User ---
        try {
            auditLogService.logAudit(
                    "User",
                    savedUser.getId(),
                    "CREATE",
                    savedUser.getCreatedBy(), // This will be populated by Spring Data JPA Auditing
                    null, // No old value for create
                    objectMapper.writeValueAsString(savedUser), // New value as JSON
                    "New User registered"
            );
        } catch (Exception e) {
            System.err.println("Failed to log audit for User creation: " + e.getMessage());
        }
        // --- End Audit Log ---

        return convertToDTO(savedUser);
    }

    public Optional<UserDTO> getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<UserDTO> updateUser(Long id, UserDTO userDTO) {
        Optional<User> existingUserOptional = userRepository.findById(id);
        if (existingUserOptional.isPresent()) {
            User existingUser = existingUserOptional.get();

            // Update fields from DTO to existing entity
            existingUser.setUsername(userDTO.getUsername());
            // Only update password if provided and not null, and ensure encoding
            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                existingUser.setPassword(userDTO.getPassword()); // Encode in real app
            }
            existingUser.setEmail(userDTO.getEmail());
            existingUser.setFirstName(userDTO.getFirstName());
            existingUser.setLastName(userDTO.getLastName());
            existingUser.setPhoneNumber(userDTO.getPhoneNumber());

            User updatedUser = userRepository.save(existingUser);
            return Optional.of(convertToDTO(updatedUser));
        }
        return Optional.empty();
    }

    public boolean deleteUser(Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
