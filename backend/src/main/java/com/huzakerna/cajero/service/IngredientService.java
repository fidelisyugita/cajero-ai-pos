package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.Ingredient;
import com.huzakerna.cajero.repository.IngredientRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class IngredientService {

    private final StoreRepository sRepo;
    private final IngredientRepository repo;

    public Ingredient addIngredient(Ingredient request) {
        // Validate store exists
        if (!sRepo.existsById(request.getStoreId())) {
            throw new IllegalArgumentException("Store not found");
        }

        return repo.save(
                Ingredient.builder()
                        .storeId(request.getStoreId())
                        .name(request.getName())
                        .description(request.getDescription())
                        .measureUnitCode(request.getMeasureUnitCode())
                        .stock(request.getStock())
                        .build());

    }

}
