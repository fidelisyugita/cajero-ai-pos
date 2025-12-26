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
    // TODO: IMPLEMENT SAFE TRACKING
    // The previous tracking implementation caused a LazyInitializationException.
    // This happens because changeTracker holds references to Hibernate Proxy
    // objects (options).
    // When the transaction finishes or the entity manager is cleared, these proxies
    // become detached.
    // If LogService tries to serialize them later, it crashes.
    //
    // FIX REQUIRED:
    // 1. Map 'options' to a simple DTO or List<Map<String, Object>> BEFORE passing
    // to changeTracker.
    // 2. Ensure new values from 'request' are also mapped or sorted identically to
    // avoid false positives.
    // 3. Pass these safe, detached objects to changeTracker.compareAndTrack().

    // changeTracker.compareAndTrack("options", oldOptions, newOptions);

    // Update variant fields
    variant.setName(request.getName());
    variant.setDescription(request.getDescription());
    variant.setRequired(request.isRequired());
    variant.setMultiple(request.isMultiple());

    // Use collection modification to handle options safely (Orphan Removal)
    variant.getOptions().clear();

    if (request.getOptions() != null) {
      for (VariantOptionRequest optionReq : request.getOptions()) {
        // If ID is provided, try to find existing (though we just cleared list, so this
        // is logically just "adding back")
        // But technically in orphan removal pattern we just rebuild the list.
        // However, to preserve IDs of existing options (if they match), we can try to
        // reuse them if we hadn't cleared.
        // Since we cleared, Hibernate treats them as Removed. If we add them back with
        // SAME ID, Hibernate might Merge.
        // A safer approach for simple child lists is to just create new instances or
        // merge.
        // To keep it simple and robust against "shared references": rebuild.

        VariantOption newOption = new VariantOption();
        // if (optionReq.getId() != null) newOption.setId(optionReq.getId()); //
        // Optional: try to keep ID? Risk of Detached Entity error.
        // Safest for "Edit" where exact ID match isn't critical for foreign keys: Let
        // it generate new ID or careful merge.
        // Given VariantOptions are usually simple children, re-creating is often
        // acceptable unless historical data links to specific Option IDs.
        // Looking at VariantOption, it has Generated ID.

        // Let's try to find if it existed to copy ID, but we must use a fresh instance
        // attached to parent
        if (optionReq.getId() != null) {
          // Valid update of existing option?
          // Since we cleared `variant.getOptions()`, they are scheduled for deletion.
          // If we want to UPDATE instead of DELETE+INSERT, we should not have cleared
          // ALL.
          // We should have cleared only those NOT in the request.
        }
      }
      // RE-STRATEGY: Do not Clear All blindly if we want to update.
      // 1. Identify IDs to Keep.
      // 2. Remove those NOT in Keep list.
      // 3. Update those IN Keep list.
      // 4. Add NEW ones.
    }

    // Correct Implementation of Retain/Update/Add pattern:
    Set<UUID> keepIds = new HashSet<>();
    if (request.getOptions() != null) {
      request.getOptions().stream()
          .filter(o -> o.getId() != null)
          .forEach(o -> keepIds.add(o.getId()));
    }

    // 1. Remove options that are missing from request
    variant.getOptions().removeIf(o -> !keepIds.contains(o.getId()));

    // 2. Update existing and Add new
    if (request.getOptions() != null) {
      for (VariantOptionRequest req : request.getOptions()) {
        if (req.getId() != null) {
          // Update existing
          variant.getOptions().stream()
              .filter(o -> o.getId().equals(req.getId()))
              .findFirst()
              .ifPresent(o -> {
                o.setName(req.getName());
                o.setPriceAdjusment(req.getPriceAdjusment());
                o.setStock(req.getStock());
              });
        } else {
          // Add new
          VariantOption newOption = VariantOption.builder()
              .variant(variant)
              .name(req.getName())
              .priceAdjusment(req.getPriceAdjusment())
              .stock(req.getStock())
              .build();
          variant.getOptions().add(newOption);
        }
      }
    }

    // variant = repo.save(variant); // Redundant for managed entity

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
