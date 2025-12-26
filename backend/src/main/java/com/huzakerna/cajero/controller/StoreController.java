package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.dto.store.CreateStoreWithUserRequest;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreRepository repo;
    private final StoreService storeService;

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @GetMapping
    public ResponseEntity<List<Store>> getAll(
            @RequestHeader("X-Admin-Secret") String secretKey) {

        if (!adminSecretKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Store>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @PostMapping("/admin")
    public ResponseEntity<Store> createStoreWithUser(
            @RequestHeader("X-Admin-Secret") String secretKey,
            @Valid @RequestBody CreateStoreWithUserRequest request) {

        if (!adminSecretKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStoreWithUser(request));
    }
}
