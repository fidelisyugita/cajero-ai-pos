package com.huzakerna.cajero.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.huzakerna.cajero.filter.JwtAuthFilter;
import com.huzakerna.cajero.security.UserDetailsServiceImpl;
import com.huzakerna.cajero.util.JwtUtils;

@Configuration
public class FilterConfig {

  @Bean
  public JwtAuthFilter jwtAuthFilter(JwtUtils jwtUtils, UserDetailsServiceImpl userDetailsService) {
    JwtAuthFilter filter = new JwtAuthFilter();
    filter.setJwtUtils(jwtUtils);
    filter.setUserDetailsService(userDetailsService);
    return filter;
  }
}
