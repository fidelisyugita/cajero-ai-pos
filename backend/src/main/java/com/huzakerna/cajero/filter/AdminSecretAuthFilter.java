package com.huzakerna.cajero.filter;

import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.security.UserDetailsImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
@Slf4j
public class AdminSecretAuthFilter extends OncePerRequestFilter {

  @Value("${admin.secret-key}")
  private String adminSecretKey;

  @Override
  protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    String secretKey = request.getHeader("X-Admin-Secret");

    // If header is present and matches the configured secret key
    if (secretKey != null && secretKey.equals(adminSecretKey)) {

      // If no existing authentication or we want to override?
      // Usually if X-Admin-Secret is present, it takes precedence or is used when no
      // JWT.
      if (SecurityContextHolder.getContext().getAuthentication() == null) {

        // Create a dummy Test user
        User systemUser = User.builder()
            .id(UUID.randomUUID()) // Random ID or fixed NULL? Random is safer for NPEs on getId()
            .name("Test")
            .email("test@system.local")
            .roleCode("OWNER")
            .storeId(null) // Test doesn't belong to a store
            .build();

        UserDetailsImpl userDetails = new UserDetailsImpl(systemUser);

        // Grant all major roles so this key acts as a "God Mode"
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_ADMIN"),
            new SimpleGrantedAuthority("ROLE_OWNER"),
            new SimpleGrantedAuthority("ROLE_MANAGER"));

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
            userDetails,
            null,
            authorities);

        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authToken);
        log.debug("System Admin authenticated via X-Admin-Secret");
      }
    }

    filterChain.doFilter(request, response);
  }
}
