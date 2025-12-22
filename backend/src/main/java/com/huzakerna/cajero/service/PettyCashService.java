package com.huzakerna.cajero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.huzakerna.cajero.model.PettyCash;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.util.ChangeTracker;

import jakarta.persistence.Column;
import jakarta.persistence.EntityNotFoundException;

import com.huzakerna.cajero.repository.PettyCashRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PettyCashService {

    private final PettyCashRepository repo;
    private final StoreRepository sRepo;
    private final LogService logService;

    public PettyCash addPettyCash(UUID storeId, PettyCash request) {

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }

        PettyCash pettyCash = PettyCash.builder()
                .storeId(storeId)
                .amount(request.getAmount())
                .isIncome(request.getIsIncome())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .build();

        PettyCash savedPettyCash = repo.save(pettyCash);
        return (savedPettyCash);
    }

    public PettyCash updatePettyCash(UUID storeId, UUID id, PettyCash request) {

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }
        // Find existing transaction
        PettyCash pettyCash = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("PettyCash not found"));

        // Verify the transaction belongs to the store
        if (!pettyCash.getStoreId().equals(storeId)) {
            throw new IllegalArgumentException("PettyCash does not belong to the store");
        }

        // Create log details
        var logDetails = new java.util.HashMap<String, Object>();
        logDetails.put("pettyCashId", id);

        // Create change tracker
        ChangeTracker changeTracker = new ChangeTracker();
        // Compare and store only changed values
        changeTracker.compareAndTrack("amount", pettyCash.getAmount(), request.getAmount());
        changeTracker.compareAndTrack("isIncome", pettyCash.getIsIncome(),
                request.getIsIncome());
        changeTracker.compareAndTrack("imageUrl", pettyCash.getImageUrl(),
                request.getImageUrl());
        changeTracker.compareAndTrack("description", pettyCash.getDescription(), request.getDescription());

        pettyCash.setAmount(request.getAmount());
        pettyCash.setIsIncome(request.getIsIncome());
        pettyCash.setImageUrl(request.getImageUrl());
        pettyCash.setDescription(request.getDescription());

        pettyCash = repo.save(pettyCash);

        // Only add oldValues and newValues to log details if there were changes
        if (changeTracker.hasChanges()) {
            logDetails.put("oldValues", changeTracker.getOldValues());
            logDetails.put("newValues", changeTracker.getNewValues());
            logService.logAction(storeId, "pettyCash", "updated", logDetails);
        }

        return (pettyCash);
    }

    public PettyCash getPettyCashById(UUID id) {
        PettyCash pettyCash = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("PettyCash not found"));

        return (pettyCash);
    }

    public List<PettyCash> getAllPettyCashs() {
        return repo.findAll();
    }

}
