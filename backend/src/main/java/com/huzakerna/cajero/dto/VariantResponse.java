package com.huzakerna.cajero.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

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
public class VariantResponse {

    private UUID id;
    private UUID storeId;

    private UUID productId;

    private String name;
    private String description;
    private boolean isRequired;
    private boolean isMultiple;

    private List<VariantOptionResponse> options;

    private UUID createdBy;
    private UUID updatedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
