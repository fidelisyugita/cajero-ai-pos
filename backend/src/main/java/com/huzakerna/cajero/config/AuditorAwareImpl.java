package com.huzakerna.cajero.config;

import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.UserRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component("auditorAware")
@RequiredArgsConstructor
@Slf4j
public class AuditorAwareImpl implements AuditorAware<User> {

  private final UserRepository userRepository;

  @Override
  public Optional<User> getCurrentAuditor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    if (authentication == null || !authentication.isAuthenticated()
        || authentication.getPrincipal().equals("anonymousUser")) {
      log.debug("Current Auditor: No authenticated user found.");
      return Optional.empty();
    }

    try {
      Object principal = authentication.getPrincipal();

      if (principal instanceof UserDetailsImpl) {
        var userDetails = (UserDetailsImpl) principal;
        log.debug("Current Auditor: Found UserDetailsImpl for user ID: {}", userDetails.getUser().getId());
        // Use getReferenceById to avoid DB query and flush loop.
        // Returns a proxy which is sufficient for setting the relationship.
        return Optional.of(userRepository.getReferenceById(userDetails.getUser().getId()));
      }

      String email = authentication.getName();
      log.debug("Current Auditor: Principal is not UserDetailsImpl. Fallback to findByEmail for: {}", email);

      if (email == null) {
        log.warn("Current Auditor: Email is null from authentication");
        return Optional.empty();
      }

      return userRepository.findByEmail(email);

    } catch (Exception e) {
      log.error("Current Auditor: Error resolving auditor", e);
      return Optional.empty();
    }
  }
}
