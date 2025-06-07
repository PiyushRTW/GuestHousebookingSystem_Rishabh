package com.Application.GuestHouseBooking.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import lombok.Getter;

@Getter
@Configuration
public class JwtConfig {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}") // 24 hours in milliseconds
    private Long expiration;

    @Value("${jwt.header}")
    private String header;

    @Value("${jwt.prefix}")
    private String prefix;

    // Add clock skew tolerance
    @Value("${jwt.clock-skew}") // 5 minutes in milliseconds
    private Long clockSkew;
}