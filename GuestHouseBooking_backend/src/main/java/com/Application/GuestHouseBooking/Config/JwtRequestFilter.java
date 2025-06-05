package com.Application.GuestHouseBooking.Config;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;


@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private JwtConfig jwtConfig;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader(jwtConfig.getHeader());

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith(jwtConfig.getPrefix() + " ")) {
            jwt = authorizationHeader.substring(jwtConfig.getPrefix().length() + 1);
            try {
                username = jwtUtil.extractUsername(jwt);
            } catch (IllegalArgumentException e) {
                System.err.println("JWT Token: Unable to get JWT Token (e.g., token is null/empty): " + e.getMessage());
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid JWT Token format or missing token.");
                return;
            } catch (ExpiredJwtException e) {
                System.err.println("JWT Token: Expired JWT Token: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token has expired.");
                return;
            } catch (SignatureException e) { // This is the one you asked about
                System.err.println("JWT Token: Invalid JWT Signature: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid JWT Token signature.");
                return;
            } catch (MalformedJwtException e) {
                System.err.println("JWT Token: Malformed JWT Token (e.g., invalid structure): " + e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Malformed JWT Token.");
                return;
            } catch (Exception e) {
                System.err.println("JWT Token: An unexpected error occurred during token parsing: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "An unexpected error occurred with the token.");
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(username);
            } catch (Exception e) {
                System.err.println("JWT Token: User from token not found in UserDetailsService: " + e.getMessage());
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "User associated with token not found.");
                return;
            }

            if (jwtUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                System.err.println("JWT Token: Token validation failed for user: " + username);
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "JWT Token validation failed.");
                return;
            }
        }
        chain.doFilter(request, response);
    }
} 