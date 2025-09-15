package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.VariantOptionRequest;
import com.huzakerna.cajero.dto.VariantOptionResponse;
import com.huzakerna.cajero.dto.VariantRequest;
import com.huzakerna.cajero.dto.VariantResponse;
import com.huzakerna.cajero.model.Variant;
import com.huzakerna.cajero.model.VariantOption;
import com.huzakerna.cajero.repository.VariantRepository;
import com.huzakerna.cajero.util.ChangeTracker;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.VariantOptionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class VariantService {

  private final StoreRepository sRepo;
  private final VariantRepository repo;
  private final VariantOptionRepository voRepo;
  private final VariantOptionService voService;
  private final LogService logService;

  public List<VariantResponse> getAllByStoreId(UUID storeId) {
    return repo.findByStoreIdAndDeletedAtIsNull(storeId).stream()
        .map(this::mapToResponse)
        .toList();
  }

  public VariantResponse getVariantById(UUID id) {
    Variant variant = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Variant not found"));

    return mapToResponse(variant);
  }

  public VariantResponse addVariant(UUID storeId, VariantRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    Variant variant = repo.save(
        Variant.builder()
            .storeId(storeId)
            .productId(request.getProductId())
            .name(request.getName())
            .description(request.getDescription())
            .isRequired(request.isRequired())
            .isMultiple(request.isMultiple())
            .build());

    Set<VariantOption> options = new HashSet<>();

    // Add variant options if any
    if (request.getOptions() != null) {
      for (VariantOptionRequest option : request.getOptions()) {
        option.setVariantId(variant.getId());
        VariantOption variantOption = voService.addVariantOption(option);
        options.add(variantOption);
      }
    }

    variant.setOptions(options);

    return mapToResponse(variant);

  }

  public VariantResponse updateVariant(UUID storeId, UUID id, VariantRequest request) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing variant
    Variant variant = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Variant not found"));

    // Verify the variant belongs to the store
    if (!variant.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Variant does not belong to the store");
    }

    // Create log details
    var logDetails = new java.util.HashMap<String, Object>();
    logDetails.put("variantId", id);

    // Create change tracker
    ChangeTracker changeTracker = new ChangeTracker();
    // Compare and store only changed values
    changeTracker.compareAndTrack("name", variant.getName(), request.getName());
    changeTracker.compareAndTrack("description", variant.getDescription(),
        request.getDescription());
    changeTracker.compareAndTrack("isRequired", variant.isRequired(),
        request.isRequired());
    changeTracker.compareAndTrack("isMultiple", variant.isMultiple(),
        request.isMultiple());
    changeTracker.compareAndTrack("options", variant.getOptions(),
        request.getOptions());

    // Update variant fields
    variant.setName(request.getName());
    variant.setDescription(request.getDescription());
    variant.setRequired(request.isRequired());
    variant.setMultiple(request.isMultiple());

    Set<VariantOption> options = new HashSet<>();

    // Add variant options if any
    if (request.getOptions() != null) {
      for (VariantOptionRequest option : request.getOptions()) {
        if (option.getId() != null) {
          VariantOption optionToUpdate = voRepo.findById(option.getId())
              .orElseThrow(() -> new RuntimeException("Variant Option not found"));
          optionToUpdate.setName(option.getName());
          optionToUpdate.setPriceAdjusment(option.getPriceAdjusment());
          optionToUpdate.setStock(option.getStock());
          VariantOption updatedOption = voRepo.save(optionToUpdate);
          options.add(updatedOption);
        } else {
          option.setVariantId(variant.getId());
          VariantOption variantOption = voService.addVariantOption(option);
          options.add(variantOption);
        }
      }
    }

    variant.setOptions(options);

    variant = repo.save(variant);

    // Only add oldValues and newValues to log details if there were changes
    if (changeTracker.hasChanges()) {
      logDetails.put("oldValues", changeTracker.getOldValues());
      logDetails.put("newValues", changeTracker.getNewValues());
      logService.logAction(storeId, "variant", "updated", logDetails);
    }

    return mapToResponse(variant);
  }

  // soft delete
  public VariantResponse removeVariant(UUID storeId, UUID id) {
    // Validate store exists
    if (!sRepo.existsById(storeId)) {
      throw new IllegalArgumentException("Store not found");
    }

    // Find existing variant
    Variant variant = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Variant not found"));

    // Verify the variant belongs to the store
    if (!variant.getStoreId().equals(storeId)) {
      throw new IllegalArgumentException("Variant does not belong to the store");
    }

    // Update variant fields
    variant.setDeletedAt(LocalDateTime.now());

    variant = repo.save(variant);

    // Create log details
    var logDetails = new HashMap<String, Object>();
    logDetails.put("variantId", id);
    logService.logAction(storeId, "variant", "deleted", logDetails);

    return mapToResponse(variant);
  }

  private VariantResponse mapToResponse(Variant variant) {
    return VariantResponse.builder()
        .id(variant.getId())
        .storeId(variant.getStoreId())
        .name(variant.getName())
        .description(variant.getDescription())
        .isRequired(variant.isRequired())
        .isMultiple(variant.isMultiple())
        .createdBy(variant.getCreatedBy())
        .updatedBy(variant.getUpdatedBy())
        .createdAt(variant.getCreatedAt())
        .updatedAt(variant.getUpdatedAt())
        .options(variant.getOptions().stream()
            .map(vo -> VariantOptionResponse.builder()
                .id(vo.getId())
                .name(vo.getName())
                .priceAdjusment(vo.getPriceAdjusment())
                .stock(vo.getStock())
                .variantId(vo.getVariantId())
                .build())
            .toList())
        .build();
  }

}
