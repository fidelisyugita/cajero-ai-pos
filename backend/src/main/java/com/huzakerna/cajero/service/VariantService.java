package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.*;

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

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
@Transactional
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
    var logDetails = new HashMap<String, Object>();
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
    // Track Variant Options changes
    if (request.getOptions() != null) {
      Map<UUID, VariantOption> oldMap = variant.getOptions().stream()
          .collect(java.util.stream.Collectors.toMap(VariantOption::getId, o -> o));

      Set<UUID> newIds = new HashSet<>();

      for (VariantOptionRequest newOpt : request.getOptions()) {
        if (newOpt.getId() != null && oldMap.containsKey(newOpt.getId())) {
          newIds.add(newOpt.getId());
          VariantOption oldOpt = oldMap.get(newOpt.getId());
          changeTracker.compareAndTrack("option_name," + oldOpt.getId(), oldOpt.getName(), newOpt.getName());
          changeTracker.compareAndTrack("option_priceAdjustment," + oldOpt.getId(), oldOpt.getPriceAdjusment(),
              newOpt.getPriceAdjusment());
          changeTracker.compareAndTrack("option_stock," + oldOpt.getId(), oldOpt.getStock(), newOpt.getStock());
        } else {
          // Added
          changeTracker.compareAndTrack("option_added," + newOpt.getName(), null, newOpt.getPriceAdjusment());
        }
      }

      for (UUID oldId : oldMap.keySet()) {
        if (!newIds.contains(oldId)) {
          changeTracker.compareAndTrack("option_removed," + oldId, oldMap.get(oldId).getName(), null);
        }
      }
    }

    // Update variant fields
    variant.setName(request.getName());
    variant.setDescription(request.getDescription());
    variant.setRequired(request.isRequired());
    variant.setMultiple(request.isMultiple());

    // Prepare new options set
    Set<VariantOption> newOptions = new HashSet<>();
    if (request.getOptions() != null) {
      for (VariantOptionRequest req : request.getOptions()) {
        VariantOption option = VariantOption.builder()
            .variant(variant)
            .name(req.getName())
            .priceAdjusment(req.getPriceAdjusment())
            .stock(req.getStock())
            .build();

        // If ID is provided, maintain it to update existing record instead of
        // delete-insert
        if (req.getId() != null) {
          option.setId(req.getId());
        }

        newOptions.add(option);
      }
    }

    // Safely update options collection
    variant.setOptions(newOptions);

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
        .createdBy(variant.getCreatedBy() != null ? variant.getCreatedBy().getId() : null)
        .createdByName(variant.getCreatedBy() != null ? variant.getCreatedBy().getName() : null)
        .updatedBy(variant.getUpdatedBy() != null ? variant.getUpdatedBy().getId() : null)
        .updatedByName(variant.getUpdatedBy() != null ? variant.getUpdatedBy().getName() : null)
        .createdAt(variant.getCreatedAt())
        .updatedAt(variant.getUpdatedAt())
        .options(variant.getOptions() != null ? variant.getOptions().stream()
            .map(vo -> VariantOptionResponse.builder()
                .id(vo.getId())
                .name(vo.getName())
                .priceAdjusment(vo.getPriceAdjusment())
                .stock(vo.getStock())
                .variantId(vo.getVariantId())
                .build())
            .toList() : List.of())
        .build();
  }

}
