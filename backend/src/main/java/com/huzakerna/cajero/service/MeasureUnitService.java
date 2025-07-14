package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class MeasureUnitService {

        private final StoreRepository sRepo;
        private final MeasureUnitRepository repo;

        public MeasureUnit addMeasureUnit(MeasureUnit request) {
                // Validate store exists
                if (!sRepo.existsById(request.getStoreId())) {
                        throw new IllegalArgumentException("Store not found");
                }

                return repo.save(
                        MeasureUnit.builder()
                                .code(request.getCode())
                                .storeId(request.getStoreId())
                                .name(request.getName())
                                .description(request.getDescription())
                                .build());

        }


}
