package com.huzakerna.cajero.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.VariantOptionIngredientRequest;
import com.huzakerna.cajero.dto.VariantOptionRequest;
import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.model.Variant;
import com.huzakerna.cajero.model.VariantOption;
import com.huzakerna.cajero.model.VariantOptionIngredient;
import com.huzakerna.cajero.model.VariantOptionIngredientId;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.VariantOptionIngredientRepository;
import com.huzakerna.cajero.repository.VariantOptionRepository;
import com.huzakerna.cajero.repository.VariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class VariantOptionService {

  private final VariantRepository vRepo;
  private final VariantOptionRepository repo;
  private final IngredientRepository iRepo;
  private final VariantOptionIngredientRepository voiRepo;

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

    // Add ingredients
    if (request.getIngredients() != null && !request.getIngredients().isEmpty()) {
      Set<VariantOptionIngredient> ingredients = new HashSet<>();
      for (VariantOptionIngredientRequest ingReq : request.getIngredients()) {
        Ingredient ingredient = iRepo.findById(ingReq.getIngredientId())
            .orElseThrow(() -> new IllegalArgumentException("Ingredient not found: " + ingReq.getIngredientId()));

        VariantOptionIngredient voi = VariantOptionIngredient.builder()
            .id(new VariantOptionIngredientId(ingredient.getId(), variantOption.getId()))
            .variantOption(variantOption)
            .ingredient(ingredient)
            .quantityNeeded(ingReq.getQuantityNeeded())
            .build();

        ingredients.add(voiRepo.save(voi));
      }
      variantOption.setIngredients(ingredients);
    }

    return variantOption;

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
