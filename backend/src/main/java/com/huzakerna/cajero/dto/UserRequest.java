package com.huzakerna.cajero.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank
    @Size(max = 50)
    private String role;

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
