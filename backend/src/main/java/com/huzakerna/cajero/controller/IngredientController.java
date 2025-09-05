package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.IngredientRequest;
import com.huzakerna.cajero.dto.IngredientResponse;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.IngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ingredient")
@RequiredArgsConstructor
public class IngredientController {

    private final IngredientService service;

    @GetMapping
    public ResponseEntity<List<IngredientResponse>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(service.getAllByStoreId(storeId));
    }

    @PostMapping
    public IngredientResponse add(@AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody IngredientRequest ingredient) {

        UUID storeId = user.getStoreId();
        return service.addIngredient(storeId, ingredient);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getIngredientById(id));
    }

}
