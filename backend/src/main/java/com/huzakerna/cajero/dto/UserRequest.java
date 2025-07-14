package com.huzakerna.cajero.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull(message = "Store Id is required")
    private UUID storeId;

    @NotNull(message = "Role Code is required")
    private String roleCode;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank
    private String password; // Will be hashed

    // Optional fields
    private String imageUrl;
    private String address;
    private String description;
    private String bankAccount;
    private String bankNo;
    private BigDecimal dailySalary;
    private BigDecimal overtimeRate;
}
