package com.huzakerna.cajero.controller;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.StockMovementResponse;
import com.huzakerna.cajero.model.StockMovement;
import com.huzakerna.cajero.repository.StockMovementRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.StockMovementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock-movement")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementRepository repo;
    private final StockMovementService service;

    @GetMapping
    public ResponseEntity<Page<StockMovementResponse>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) UUID ingredientId,
            @RequestParam(required = false) UUID productId,
            @RequestParam(required = false) String type) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(service.getStockMovements(
                storeId, page, size, sortBy, sortDir, startDate, endDate, ingredientId, productId, type));
    }

    // @PostMapping
    // public StockMovement add(@AuthenticationPrincipal UserDetailsImpl user,
    // @Valid @RequestBody StockMovement request) {

    // UUID storeId = user.getStoreId();
    // return service.addStockMovement(storeId, request);
    // }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<StockMovement>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

}
