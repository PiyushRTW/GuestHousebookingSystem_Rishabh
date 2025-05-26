package com.Application.GuestHouseBooking.Config;
import org.springframework.data.domain.AuditorAware;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component // Make it a Spring bean
public class AuditorAwareImpl implements AuditorAware<String> {

    @Override
    public Optional<String> getCurrentAuditor() {
        // This is where you would normally get the current logged-in user from Spring Security context
        // For now, let's return a static string.
        // Later: return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication().getName());
        return Optional.of("system_user"); // Placeholder for now
    }
}