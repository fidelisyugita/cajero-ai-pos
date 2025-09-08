package com.huzakerna.cajero.dto;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VariantRequest {

    @NotBlank(message = "Variant name cannot be empty")
    private String name;

    @NotBlank(message = "Product Id cannot be empty")
    private UUID productId;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    @Builder.Default
    private Set<VariantOptionRequest> options = new HashSet<>();

    private boolean isRequired;
    private boolean isMultiple;

}
