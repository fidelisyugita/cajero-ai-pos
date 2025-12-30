package com.huzakerna.cajero.service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.exception.TokenRefreshException;
import com.huzakerna.cajero.model.RefreshToken;
import com.huzakerna.cajero.repository.RefreshTokenRepository;
import com.huzakerna.cajero.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
  @Value("${jwt.refresh-expiration-ms}")
  private Long refreshTokenDurationMs;

  private final RefreshTokenRepository refreshTokenRepository;
  private final UserRepository userRepository;

  public Optional<RefreshToken> findByToken(String token) {
    return refreshTokenRepository.findByToken(token);
  }

  @Transactional
  public RefreshToken createRefreshToken(UUID userId) {
    // Reuse user object
    com.huzakerna.cajero.model.User user = userRepository.findById(userId).get();

    // Ensure we remove any existing token for this user to keep 1 token per user
    // policy
    // We want to support multiple devices now, so we remove this deletion.
    // refreshTokenRepository.deleteByUser(user);

    RefreshToken refreshToken = new RefreshToken();

    refreshToken.setUser(user);
    refreshToken.setExpiryDate(Instant.now().plusMillis(Math.max(refreshTokenDurationMs, 0)));
    refreshToken.setToken(UUID.randomUUID().toString());

    return refreshTokenRepository.save(refreshToken);
  }

  public RefreshToken verifyExpiration(RefreshToken token) {
    if (token.getExpiryDate().compareTo(Instant.now()) < 0) {
      refreshTokenRepository.delete(token);
      throw new TokenRefreshException(token.getToken(), "Refresh token was expired. Please make a new signin request");
    }
    return token;
  }

  @Transactional
  public int deleteByUserId(UUID userId) {
    return refreshTokenRepository.deleteByUser(userRepository.findById(userId).get());
  }
}
