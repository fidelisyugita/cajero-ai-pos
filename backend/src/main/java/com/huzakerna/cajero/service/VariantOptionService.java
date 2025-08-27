package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.VariantOption;
import com.huzakerna.cajero.repository.VariantRepository;
import com.huzakerna.cajero.repository.VariantOptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class VariantOptionService {

  private final VariantRepository vRepo;
  private final VariantOptionRepository repo;

  public VariantOption addVariant(VariantOption request) {
    // Validate variant exists
    if (!vRepo.existsById(request.getVariantId())) {
      throw new IllegalArgumentException("Variant not found");
    }

    return repo.save(
        VariantOption.builder()
            .variantId(request.getVariantId())
            .name(request.getName())
            .priceAdjusment(request.getPriceAdjusment())
            .stock(request.getStock())
            .build());

  }

}
