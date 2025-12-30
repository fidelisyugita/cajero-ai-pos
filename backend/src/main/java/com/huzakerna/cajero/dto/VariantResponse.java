package com.huzakerna.cajero.dto;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class VariantResponse extends BaseResponse {

    private UUID productId;

    private String name;
    private String description;
    private boolean isRequired;
    private boolean isMultiple;

    private List<VariantOptionResponse> options;

}
