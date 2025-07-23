package com.huzakerna.cajero.dto;


import java.time.LocalDateTime;
import java.util.UUID;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private UUID id;
    private String name;
    private String email;
    private String phone;
    private UUID storeId;
    private String roleCode;
    private String imageUrl;
    private String accessToken;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Exclude sensitive fields like passwordHash
}
