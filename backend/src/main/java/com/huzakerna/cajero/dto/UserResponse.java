package com.huzakerna.cajero.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String imageUrl;
    private LocalDateTime createdAt;
    // Exclude sensitive fields like passwordHash
}
