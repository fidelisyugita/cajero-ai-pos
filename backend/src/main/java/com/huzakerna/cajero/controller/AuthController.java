package com.huzakerna.cajero.controller;

import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.config.JwtUtils;
import com.huzakerna.cajero.dto.JwtResponse;
import com.huzakerna.cajero.dto.LoginRequest;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.UserRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class AuthController {
  private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

  private final AuthenticationManager authenticationManager;
  private final JwtUtils jwtUtils;
  private final UserService userService;
  private final UserRepository userRepo;
  private final PasswordEncoder encoder;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
    try {
      logger.info("Attempting authentication for: {}", loginRequest.email());
      logger.info("Attempting authentication with password: {}", loginRequest.password());

      Authentication authentication = authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(
          loginRequest.email(),
          loginRequest.password()));


      UserDetailsImpl userDetails = ((UserDetailsImpl) authentication.getPrincipal());
      logger.info("Authentication successful for: {}", userDetails.getUsername());
      String jwt = jwtUtils.generateToken(userDetails);

      return ResponseEntity.ok(new JwtResponse(jwt));

    } catch (BadCredentialsException e) {
      logger.error("Invalid credentials for: {}", loginRequest.email());
      return ResponseEntity.status(401).body("Invalid credentials");
    } catch (Exception e) {
      logger.error("Authentication error", e);
      return ResponseEntity.status(500).body("Authentication failed");
    }
  }

  @GetMapping("/verify-pass")
  public ResponseEntity<?> verifyPassword(
    @RequestParam String email,
    @RequestParam String rawPassword) {

    User user = userRepo.findByEmail(email)
      .orElseThrow(() -> new RuntimeException("User not found"));

    boolean matches = encoder.matches(rawPassword, user.getPasswordHash());

    return ResponseEntity.ok(Map.of(
      "storedHash", user.getPasswordHash(),
      "inputMatches", matches));
  }

  @PostMapping("/signup")
  public ResponseEntity<?> registerUser(@RequestBody UserRequest userRequest) {
    userService.addUser(userRequest);

    return ResponseEntity.ok("User registered successfully!");
  }
}
