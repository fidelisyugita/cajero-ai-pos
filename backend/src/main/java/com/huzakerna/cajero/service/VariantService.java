package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.Variant;
import com.huzakerna.cajero.repository.VariantRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class VariantService {

        private final StoreRepository sRepo;
        private final VariantRepository repo;

        public Variant addVariant(Variant request) {
                // Validate store exists
                if (!sRepo.existsById(request.getStoreId())) {
                        throw new IllegalArgumentException("Store not found");
                }

                return repo.save(
                        Variant.builder()
                                .storeId(request.getStoreId())
                                .name(request.getName())
                                .description(request.getDescription())
                                .isRequired(request.isRequired())
                                .isMultiple(request.isMultiple())
                                .options(request.getOptions())
                                .build());

        }


}
