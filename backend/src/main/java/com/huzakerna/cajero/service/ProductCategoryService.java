package com.huzakerna.cajero.service;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductCategoryService {

  private final StoreRepository sRepo;
  private final ProductCategoryRepository repo;

  public ProductCategory addProductCategory(ProductCategory request) {
    if (!sRepo.existsById(request.getStoreId())) {
      throw new IllegalArgumentException("Store not found");
    }

    return repo.save(
        ProductCategory.builder()
            .code(request.getCode())
            .storeId(request.getStoreId())
            .name(request.getName())
            .description(request.getDescription())
            .build());

  }

}
