package com.huzakerna.cajero.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
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
import com.huzakerna.cajero.filter.JwtAuthFilter;
import com.huzakerna.cajero.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
  private final UserDetailsServiceImpl userDetailsService;

  @Bean
  @Order(1) // Higher priority for Swagger security
  public SecurityFilterChain swaggerFilterChain(
    HttpSecurity http,
    @Value("${swagger.username}") String username,
    @Value("${swagger.password}") String password,
    PasswordEncoder encoder) throws Exception {

    http
      .httpBasic(Customizer.withDefaults())
      .csrf(csrf -> csrf.disable())
      .securityMatcher("/swagger-ui/**", "/v3/api-docs/**")
      .authorizeHttpRequests(auth -> auth.anyRequest().hasRole("SWAGGER"))
      .userDetailsService(swaggerUsers(username, password, encoder));

    return http.build();
  }

  @Bean
  @Order(2) // Lower priority for JWT security
  public SecurityFilterChain apiFilterChain(HttpSecurity http,
    JwtAuthFilter jwtAuthFilter) throws Exception {
    http
      .cors(Customizer.withDefaults())
      .csrf(AbstractHttpConfigurer::disable)
      .securityMatcher("/api/**")
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/api/auth/signin").permitAll()
        .requestMatchers("/api/user/**").hasRole("OWNER")
        .anyRequest().authenticated())
      .userDetailsService(userDetailsService) // Use your service
      .sessionManagement(session -> session
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  private UserDetailsService swaggerUsers(String username, String password,
    PasswordEncoder encoder) {
    UserDetails user = User.builder()
      .username(username)
      .password(encoder.encode(password))
      .roles("SWAGGER")
      .build();
    return new InMemoryUserDetailsManager(user);
  }

  // @Bean
  // public UserDetailsService userDetailsService(UserRepository userRepository) {
  // return email -> userRepository.findByEmail(email)
  // .map(user -> new UserDetails() {
  // @Override
  // public Collection<? extends GrantedAuthority> getAuthorities() {
  // return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRoleCode()));
  // }

  // @Override
  // public String getPassword() {
  // return user.getPasswordHash(); // Must match DB column name
  // }

  // @Override
  // public String getUsername() {
  // return user.getEmail();
  // }
  // // ... other methods return true
  // })
  // .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  // }

  // @Bean
  // public AuthenticationManager authenticationManager(
  // HttpSecurity http,
  // PasswordEncoder encoder,
  // UserDetailsService userDetailsService) throws Exception {

  // return http.getSharedObject(AuthenticationManagerBuilder.class)
  // .userDetailsService(userDetailsService)
  // .passwordEncoder(encoder)
  // .and()
  // .build();
  // }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
    throws Exception {
    return config.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
