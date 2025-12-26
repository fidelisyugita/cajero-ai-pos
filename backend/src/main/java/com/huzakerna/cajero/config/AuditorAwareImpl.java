package com.huzakerna.cajero.config;

import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAware")
@RequiredArgsConstructor
public class AuditorAwareImpl implements AuditorAware<User> {

  private final UserRepository userRepository;

  @Override
  public Optional<User> getCurrentAuditor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()
        || authentication.getPrincipal().equals("anonymousUser")) {
      return Optional.empty();
    }

    try {
      // Assuming the principal is the UserDetailsImpl which likely contains the ID or
      // we can cast to it
      // Or if usage of UserDetailsImpl, we might need to cast.
      // Let's check how authentication is set in JwtAuthFilter.
      // Usually it sets a UserDetails object.

      // Checking standard Spring Security behavior:
      Object principal = authentication.getPrincipal();

      // If the principal is our User entity or has the ID, we can use it.
      // However, to be safe and ensure we have the attached entity for JPA,
      // we should probably fetch it or use a reference if we are sure it exists.

      // Let's assume the username (email) is available and fetch the user.
      // This is safer for consistency but adds a query.
      // Alternatively, if UserDetailsImpl has the ID, we can use
      // uRepo.getReferenceById(id).

      String email = authentication.getName();
      return userRepository.findByEmail(email);

    } catch (Exception e) {
      return Optional.empty();
    }
  }
}
