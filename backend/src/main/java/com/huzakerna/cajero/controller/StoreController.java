package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.StoreRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class StoreController {

    private final StoreRepository repo;

    @GetMapping
    public ResponseEntity<List<Store>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Store>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @PostMapping
    public ResponseEntity<Store> add(
        @Valid @RequestBody Store store) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(repo.save(store));
    }
}
