package com.huzakerna.cajero.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
  @NotBlank(message = "Email is required") @Email(message = "Email should be valid") String email,

  @NotBlank(message = "Password is required") String password) {
  // Compact constructor for additional validation
  public LoginRequest {
    email = email.trim();
  }
}
