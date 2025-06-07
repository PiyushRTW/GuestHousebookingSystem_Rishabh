package com.Application.GuestHouseBooking.Config;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Autowired
    private JwtConfig jwtConfig;

    private Key key;
    private Set<String> tokenBlacklist = new HashSet<>();

    @PostConstruct
    public void init() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtConfig.getSecret());
            this.key = Keys.hmacShaKeyFor(keyBytes);
            logger.info("JWT key initialized successfully");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT key: {}", e.getMessage());
            throw new RuntimeException("Failed to initialize JWT key", e);
        }
    }

    public String extractUsername(String token) {
        try {
            return extractClaim(token, Claims::getSubject);
        } catch (Exception e) {
            logger.error("Error extracting username from token: {}", e.getMessage());
            throw e;
        }
    }

    public Date extractExpiration(String token) {
        try {
            return extractClaim(token, Claims::getExpiration);
        } catch (Exception e) {
            logger.error("Error extracting expiration from token: {}", e.getMessage());
            throw e;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .setAllowedClockSkewSeconds(jwtConfig.getClockSkew() / 1000)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (ExpiredJwtException e) {
            logger.error("Token has expired: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            logger.error("Malformed token: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            logger.error("Invalid token signature: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Error parsing token: {}", e.getMessage());
            throw e;
        }
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Boolean isTokenExpired(String token) {
        try {
            final Date expiration = extractExpiration(token);
            boolean isExpired = expiration.before(new Date(System.currentTimeMillis() - jwtConfig.getClockSkew()));
            if (isExpired) {
                logger.debug("Token has expired. Expiration: {}, Current time: {}", expiration, new Date());
            }
            return isExpired;
        } catch (Exception e) {
            logger.error("Error checking token expiration: {}", e.getMessage());
            return true;
        }
    }

    public String generateToken(UserDetails userDetails) {
        try {
            Map<String, Object> claims = new HashMap<>();
            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_USER");
            claims.put("role", role.startsWith("ROLE_") ? role.substring(5) : role);
            
            String token = createToken(claims, userDetails.getUsername());
            logger.debug("Generated token for user: {}", userDetails.getUsername());
            return token;
        } catch (Exception e) {
            logger.error("Error generating token for user {}: {}", userDetails.getUsername(), e.getMessage());
            throw new RuntimeException("Error generating token", e);
        }
    }

    private String createToken(Map<String, Object> claims, String subject) {
        try {
            long currentTimeMillis = System.currentTimeMillis();
            Date issuedAt = new Date(currentTimeMillis);
            Date expirationDate = new Date(currentTimeMillis + jwtConfig.getExpiration());
            
            String token = Jwts.builder()
                    .setClaims(claims)
                    .setSubject(subject)
                    .setIssuedAt(issuedAt)
                    .setExpiration(expirationDate)
                    .signWith(key, SignatureAlgorithm.HS256)
                    .compact();
            
            logger.debug("Created token for subject: {}. Issued at: {}, Expires at: {}", 
                    subject, issuedAt, expirationDate);
            return token;
        } catch (Exception e) {
            logger.error("Error creating token for subject {}: {}", subject, e.getMessage());
            throw new RuntimeException("Error creating token", e);
        }
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        try {
            if (isTokenBlacklisted(token)) {
                logger.warn("Token is blacklisted");
                return false;
            }
            
            final String username = extractUsername(token);
            boolean isValid = username.equals(userDetails.getUsername()) && !isTokenExpired(token);
            
            if (!isValid) {
                logger.warn("Token validation failed for user: {}. Token expired: {}", 
                        userDetails.getUsername(), isTokenExpired(token));
            }
            
            return isValid;
        } catch (Exception e) {
            logger.error("Error validating token: {}", e.getMessage());
            return false;
        }
    }

    public void invalidateToken(String token) {
        tokenBlacklist.add(token);
        logger.debug("Token added to blacklist");
    }

    public boolean isTokenBlacklisted(String token) {
        return tokenBlacklist.contains(token);
    }
} 