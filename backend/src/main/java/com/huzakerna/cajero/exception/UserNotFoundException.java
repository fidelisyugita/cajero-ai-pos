package com.huzakerna.cajero.exception;

import java.util.UUID;

public class UserNotFoundException extends RuntimeException {
  public UserNotFoundException(UUID id) {
    super("User with ID " + id + " not found");
  }

  public UserNotFoundException(String email) {
    super("User with email " + email + " not found");
  }

}
