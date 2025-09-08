package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.IngredientRequest;
import com.huzakerna.cajero.dto.IngredientResponse;
import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.StoreRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class IngredientService {

  private final StoreRepository sRepo;
  private final IngredientRepository repo;
  private final MeasureUnitRepository muRepo;

  public IngredientResponse addIngredient(UUID storeId, IngredientRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }
    MeasureUnit measureUnit = muRepo.findById(request.getMeasureUnitCode())
        .orElseThrow(
            () -> new EntityNotFoundException("Measure Unit not found"));

    Ingredient ingredient = repo.save(
        Ingredient.builder()
            .storeId(storeId)
            .name(request.getName())
            .description(request.getDescription())
            .measureUnit(measureUnit)
            .stock(request.getStock())
            .build());

    return mapToResponse(ingredient);
  }

  public List<IngredientResponse> getAllIngredients() {
    return repo.findAll().stream()
        .map(this::mapToResponse)
        .toList();
  }

  public List<IngredientResponse> getAllByStoreId(UUID storeId) {
    return repo.findByStoreId(storeId).stream()
        .map(this::mapToResponse)
        .toList();
  }

  public IngredientResponse getIngredientById(UUID id) {
    Ingredient ingredient = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Ingredient not found"));
    return mapToResponse(ingredient);
  }

  public IngredientResponse updateIngredient(UUID storeId, UUID id, IngredientRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing ingredient
    Ingredient ingredient = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Ingredient not found"));

    // Verify the ingredient belongs to the store
    if (!ingredient.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Ingredient does not belong to the store");
    }

    MeasureUnit measureUnit = muRepo.findById(request.getMeasureUnitCode())
        .orElseThrow(
            () -> new EntityNotFoundException("Measure Unit not found"));

    // Update ingredient fields
    ingredient.setName(request.getName());
    ingredient.setDescription(request.getDescription());
    // ingredient.setStock(request.getStock()); // Available through StockMovement
    ingredient.setMeasureUnit(measureUnit);

    ingredient = repo.save(ingredient);
    return mapToResponse(ingredient);
  }

  // soft delete
  public IngredientResponse removeIngredient(UUID storeId, UUID id) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing ingredient
    Ingredient ingredient = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Ingredient not found"));

    // Verify the ingredient belongs to the store
    if (!ingredient.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Ingredient does not belong to the store");
    }

    // Update ingredient fields
    ingredient.setDeletedAt(LocalDateTime.now());

    ingredient = repo.save(ingredient);
    return mapToResponse(ingredient);
  }

  private IngredientResponse mapToResponse(Ingredient ingredient) {
    return IngredientResponse.builder()
        .id(ingredient.getId())
        .storeId(ingredient.getStoreId())
        .name(ingredient.getName())
        .description(ingredient.getDescription())
        .stock(ingredient.getStock())
        .measureUnitCode(ingredient.getMeasureUnit().getCode())
        .measureUnitName(ingredient.getMeasureUnit().getName())
        .createdBy(ingredient.getCreatedBy())
        .updatedBy(ingredient.getUpdatedBy())
        .createdAt(ingredient.getCreatedAt())
        .updatedAt(ingredient.getUpdatedAt())
        .build();
  }

}
