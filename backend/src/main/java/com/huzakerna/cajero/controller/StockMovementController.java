package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.StockMovement;
import com.huzakerna.cajero.repository.StockMovementRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.StockMovementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock-movement")
@RequiredArgsConstructor
public class StockMovementController {

    private final StockMovementRepository repo;
    private final StockMovementService service;

    @GetMapping
    public ResponseEntity<List<StockMovement>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(repo.findByStoreId(storeId));
    }

    @PostMapping
    public StockMovement add(@AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody StockMovement ingredient) {

        UUID storeId = user.getStoreId();
        return service.addStockMovement(storeId, ingredient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<StockMovement>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

}
