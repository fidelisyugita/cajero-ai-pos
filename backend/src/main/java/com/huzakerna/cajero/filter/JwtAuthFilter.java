package com.huzakerna.cajero.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import com.huzakerna.cajero.security.UserDetailsServiceImpl;
import com.huzakerna.cajero.util.JwtUtils;
import java.io.IOException;

public class JwtAuthFilter extends OncePerRequestFilter {
  private static final Logger logger = LoggerFactory.getLogger(JwtAuthFilter.class);

  private JwtUtils jwtUtils;
  private UserDetailsServiceImpl userDetailsService;

  @Autowired
  public void setJwtUtils(JwtUtils jwtUtils) {
    this.jwtUtils = jwtUtils;
  }

  @Autowired
  public void setUserDetailsService(UserDetailsServiceImpl userDetailsService) {
    this.userDetailsService = userDetailsService;
  }

  @SuppressWarnings("null")
  @Override
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain) throws ServletException, IOException {

    final String authHeader = request.getHeader("Authorization");
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    try {
      final String jwt = authHeader.substring(7);
      final String userEmail = jwtUtils.extractUsername(jwt);
      logger.info("Validating token for: {}", userEmail);

      if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

        if (jwtUtils.isTokenValid(jwt, userDetails)) {
          logger.info("Wait a moment...");
          UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(
              userDetails,
              null,
              userDetails.getAuthorities());

          authToken.setDetails(
            new WebAuthenticationDetailsSource().buildDetails(request));
          logger.info("Almost there...");

          SecurityContextHolder.getContext().setAuthentication(authToken);
          logger.info("Validated");
        }
      }
    } catch (Exception e) {
      // Log the error
      logger.error("Token validation failed: {}", e.getMessage());
    }

    filterChain.doFilter(request, response);
  }
}
