package com.Application.GuestHouseBooking.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Application.GuestHouseBooking.Authentication.AuthRequest;
import com.Application.GuestHouseBooking.Config.JwtUtil;
import com.Application.GuestHouseBooking.entity.User;
import com.Application.GuestHouseBooking.repository.UserRepository;

@RestController
@RequestMapping("/api/auth") // Base path for authentication-related endpoints
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService; // Your custom UserDetailsService implementation

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository; // Add this

    /**
     * Handles user login and generates a JWT upon successful authentication.
     * Accessible at /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            // Authenticate the user using Spring Security's AuthenticationManager
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            // If authentication fails (bad username/password)
            System.err.println("Authentication failed for user " + authRequest.getUsername() + ": " + e.getMessage());
            return ResponseEntity.status(401).body("{\"message\": \"Incorrect username or password\"}");
            // Or throw new BadCredentialsException("Incorrect username or password", e);
        } catch (Exception e) {
            // Catch any other authentication exceptions
            System.err.println("An error occurred during authentication for user " + authRequest.getUsername() + ": " + e.getMessage());
            return ResponseEntity.status(500).body("{\"message\": \"Authentication failed: " + e.getMessage() + "\"}");
        }

        //If authentication is successful, load UserDetails and generate JWT
        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        // Get the user entity to include role information
        User user = userRepository.findByUsername(authRequest.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Create response with both token and user info
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwt);
        response.put("username", user.getUsername());
        response.put("role", user.getRole().name());
        response.put("id", user.getId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String oldToken = authHeader.substring(7);
                
                // Validate the old token
                if (jwtUtil.isTokenBlacklisted(oldToken)) {
                    return ResponseEntity.status(401).body("{\"message\": \"Token is blacklisted\"}");
                }

                // Extract username from old token
                String username = jwtUtil.extractUsername(oldToken);
                if (username != null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    
                    // Generate new token
                    String newToken = jwtUtil.generateToken(userDetails);
                    
                    // Blacklist old token
                    jwtUtil.invalidateToken(oldToken);
                    
                    Map<String, String> response = new HashMap<>();
                    response.put("token", newToken);
                    
                    return ResponseEntity.ok(response);
                }
            }
            return ResponseEntity.status(401).body("{\"message\": \"Invalid token format\"}");
        } catch (Exception e) {
            System.err.println("Error refreshing token: " + e.getMessage());
            return ResponseEntity.status(401).body("{\"message\": \"Token refresh failed\"}");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestHeader("Authorization") String token) {
        try {
            // Clear the security context
            SecurityContextHolder.clearContext();
            
            // Add the token to the blacklist in JwtUtil
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                jwtUtil.invalidateToken(jwt);
            }
            
            return ResponseEntity.ok().body("{\"message\": \"Logged out successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"message\": \"Error during logout\"}");
        }
    }

    // You might also have a registration endpoint here if it's not handled elsewhere,
    // e.g., @PostMapping("/register")
}