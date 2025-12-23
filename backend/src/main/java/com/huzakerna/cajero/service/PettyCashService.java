package com.huzakerna.cajero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.huzakerna.cajero.model.PettyCash;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.util.ChangeTracker;

import com.huzakerna.cajero.repository.PettyCashRepository;
import jakarta.persistence.EntityNotFoundException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
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
        log.info("PettyCash added: ID={}, Amount={}, IsIncome={}", savedPettyCash.getId(), savedPettyCash.getAmount(),
                savedPettyCash.getIsIncome());
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

    public Page<PettyCash> getAllPettyCashs(UUID storeId, int page, int size, String sortBy, String sortDir,
            LocalDate startDate, LocalDate endDate) {
        LocalDateTime start = startDate != null ? startDate.atStartOfDay() : LocalDate.of(1970, 1, 1).atStartOfDay();
        LocalDateTime end = endDate != null ? endDate.atTime(23, 59, 59) : LocalDateTime.now();

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());

        return repo.findAllByStoreIdAndCreatedAtBetween(storeId, start, end, pageable);
    }
}
