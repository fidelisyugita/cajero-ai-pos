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
import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ingredient")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientRepository repo;
    private final IngredientService service;

    @GetMapping
    public ResponseEntity<List<Ingredient>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(repo.findByStoreId(storeId));
    }

    @PostMapping
    public Ingredient add(@Valid @RequestBody Ingredient ingredient) {
        return service.addIngredient(ingredient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Ingredient>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findById(id));
    }

}
