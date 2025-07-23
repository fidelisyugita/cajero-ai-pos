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
import com.huzakerna.cajero.model.Variant;
import com.huzakerna.cajero.repository.VariantRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.VariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/variant")
@RequiredArgsConstructor
public class VariantController {

    private final VariantRepository repo;
    private final VariantService service;

    @GetMapping
    public ResponseEntity<List<Variant>> getAll(
        @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(repo.findByStoreId(storeId));
    }

    @PostMapping
    public Variant add(@Valid @RequestBody Variant variant) {
        return service.addVariant(variant);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Variant>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

}
