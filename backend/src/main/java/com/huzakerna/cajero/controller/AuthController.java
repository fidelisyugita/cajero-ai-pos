package com.huzakerna.cajero.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.dto.LoginRequest;
import com.huzakerna.cajero.dto.UserResponse;
import com.huzakerna.cajero.exception.UserNotFoundException;
import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.UserRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.util.JwtUtils;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {
  // private static final Logger logger =
  // LoggerFactory.getLogger(AuthController.class);

  private final AuthenticationManager authenticationManager;
  private final JwtUtils jwtUtils;
  private final UserRepository userRepo;
  private final com.huzakerna.cajero.service.RefreshTokenService refreshTokenService;

  @PostMapping("/signin")
  public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
    try {
      log.info("Attempting authentication for: {}", loginRequest.email());
      Authentication authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(
              loginRequest.email(),
              loginRequest.password()));

      UserDetailsImpl userDetails = ((UserDetailsImpl) authentication.getPrincipal());
      log.info("Authentication successful for: {}", userDetails.getUsername());

      User user = userRepo.findByEmail(userDetails.getUsername())
          .orElseThrow(() -> new UserNotFoundException(userDetails.getUsername()));

      String jwt = jwtUtils.generateToken(user);
      com.huzakerna.cajero.model.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());

      UserResponse userResponse = UserResponse.builder()
          .id(user.getId())
          .name(user.getName())
          .email(user.getEmail())
          .phone(user.getPhone())
          .storeId(user.getStoreId())
          .roleCode(user.getRoleCode())
          .imageUrl(user.getImageUrl())
          .accessToken(jwt)
          .refreshToken(refreshToken.getToken())
          .build();

      return ResponseEntity.ok(userResponse);

    } catch (BadCredentialsException e) {
      log.error("Invalid credentials for: {}", loginRequest.email());
      return ResponseEntity.status(401).body("Invalid credentials");
    } catch (Exception e) {
      log.error("Authentication error", e);
      return ResponseEntity.status(500).body("Authentication failed");
    }
  }

  @PostMapping("/refreshtoken")
  public ResponseEntity<?> refreshtoken(@Valid @RequestBody com.huzakerna.cajero.dto.TokenRefreshRequest request) {
    String requestRefreshToken = request.refreshToken();

    return refreshTokenService.findByToken(requestRefreshToken)
        .map(refreshTokenService::verifyExpiration)
        .map(com.huzakerna.cajero.model.RefreshToken::getUser)
        .map(user -> {
          String token = jwtUtils.generateToken(user);
          return ResponseEntity.ok(com.huzakerna.cajero.dto.TokenRefreshResponse.builder()
              .accessToken(token)
              .refreshToken(requestRefreshToken)
              .build());
        })
        .orElseThrow(() -> new com.huzakerna.cajero.exception.TokenRefreshException(requestRefreshToken,
            "Refresh token is not in database!"));
  }
}
