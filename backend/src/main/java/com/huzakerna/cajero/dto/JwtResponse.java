package com.huzakerna.cajero.dto;

import io.swagger.v3.oas.annotations.media.Schema;

public record JwtResponse(
  @Schema(description = "JWT token for authenticated requests",
    example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...") String token,

  @Schema(description = "Token type", example = "Bearer") String type) {
  public JwtResponse(String token) {
    this(token, "Bearer");
  }
}
