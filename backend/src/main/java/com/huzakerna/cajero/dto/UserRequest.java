package com.huzakerna.cajero.dto;


import java.math.BigDecimal;
import java.util.UUID;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @Size(max = 100)
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Size(max = 20)
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 40,
        message = "Password must be between 8 and 40 characters")
    @Pattern(
        regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
        message = "Password must contain at least one digit, one lowercase, one uppercase, and one special character")
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
