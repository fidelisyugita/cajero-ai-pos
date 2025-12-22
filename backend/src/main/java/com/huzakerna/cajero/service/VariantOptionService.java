package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.VariantOptionRequest;
import com.huzakerna.cajero.model.Variant;
import com.huzakerna.cajero.model.VariantOption;
import com.huzakerna.cajero.repository.VariantRepository;
import com.huzakerna.cajero.repository.VariantOptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class VariantOptionService {

  private final VariantRepository vRepo;
  private final VariantOptionRepository repo;

  public VariantOption addVariantOption(VariantOptionRequest request) {
    // Validate variant exists
    Variant variant = vRepo.findById(request.getVariantId())
        .orElseThrow(() -> new IllegalArgumentException("Variant not found"));

    VariantOption variantOption = repo.save(
        VariantOption.builder()
            .variantId(request.getVariantId())
            .variant(variant) // Set the relationship
            .name(request.getName())
            .priceAdjusment(request.getPriceAdjusment())
            .stock(request.getStock())
            .build());

    return (variantOption);

  }

  // private VariantOptionResponse mapToResponse(VariantOption variantOption) {
  // return VariantOptionResponse.builder()
  // .id(variantOption.getId())
  // .variantId(variantOption.getVariantId())
  // .name(variantOption.getName())
  // .priceAdjusment(variantOption.getPriceAdjusment())
  // .stock(variantOption.getStock())
  // .build();
  // }

}
