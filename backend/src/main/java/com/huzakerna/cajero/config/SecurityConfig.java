package com.huzakerna.cajero.config;

import com.huzakerna.cajero.filter.AdminSecretAuthFilter;
import com.huzakerna.cajero.filter.JwtAuthFilter;
import com.huzakerna.cajero.security.UserDetailsServiceImpl;
import com.huzakerna.cajero.security.AuthEntryPointJwt;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

  private final UserDetailsServiceImpl userDetailsService;
  private final CorsConfigurationSource corsConfigurationSource;
  private final AuthEntryPointJwt unauthorizedHandler;

  @Bean
  @Order(1)
  public SecurityFilterChain swaggerFilterChain(
      HttpSecurity http,
      @Value("${swagger.username}") String username,
      @Value("${swagger.password}") String password,
      PasswordEncoder encoder) throws Exception {

    http
        .securityMatcher("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html")
        .authorizeHttpRequests(auth -> auth
            .anyRequest().hasRole("SWAGGER"))
        .httpBasic(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .userDetailsService(swaggerUsers(username, password, encoder));
    return http.build();
  }

  @Bean
  @Order(2)
  public SecurityFilterChain apiFilterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter,
      AdminSecretAuthFilter adminSecretAuthFilter) throws Exception {
    http
        .cors(cors -> cors.configurationSource(corsConfigurationSource))
        .csrf(AbstractHttpConfigurer::disable)
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .securityMatcher("/api/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/signin").permitAll()
            .requestMatchers("/api/public/**").permitAll()
            .requestMatchers("/api/image/**").permitAll()
            .requestMatchers("/actuator/health").permitAll()
            // .requestMatchers("/api/store/**").permitAll()
            // .requestMatchers("/api/user/**").permitAll()
            // .requestMatchers("/api/admin/**").hasRole("ADMIN")
            // .requestMatchers("/api/owner/**").hasRole("OWNER")
            .requestMatchers("/api/**").authenticated())
        .userDetailsService(userDetailsService)
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .addFilterBefore(adminSecretAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  private UserDetailsService swaggerUsers(String username, String password, PasswordEncoder encoder) {
    UserDetails user = User.builder()
        .username(username)
        .password(encoder.encode(password))
        .roles("SWAGGER")
        .build();
    return new InMemoryUserDetailsManager(user);
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }
}
