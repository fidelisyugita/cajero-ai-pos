package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductIngredientRequest;
import com.huzakerna.cajero.dto.ProductIngredientResponse;
import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.dto.ProductResponse;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductIngredient;
import com.huzakerna.cajero.model.ProductIngredientId;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.ProductIngredientRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class ProductService {

  private final StoreRepository sRepo;
  private final ProductRepository repo;
  private final ProductIngredientRepository piRepo;

  public ProductResponse addProduct(ProductRequest request) {
    // Validate store exists
    if (!sRepo.existsById(request.getStoreId())) {
      throw new IllegalArgumentException("Store not found");
    }
    ;
    // Store store = sRepo.findById(request.getStoreId())
    // .orElseThrow(
    // () -> new EntityNotFoundException("Store not found"))

    Product product = repo.save(
        Product.builder()
            .name(request.getName())
            .storeId(request.getStoreId())
            .description(request.getDescription())
            .buyingPrice(request.getBuyingPrice())
            .sellingPrice(request.getSellingPrice())
            .stock(request.getStock())
            .categoryCode(request.getCategoryCode())
            .measureUnitCode(request.getMeasureUnitCode())
            .imageUrl(request.getImageUrl())
            .barcode(request.getBarcode())
            .commission(request.getCommission())
            .discount(request.getDiscount())
            .tax(request.getTax())
            .build());

    // Add product ingredients if any
    if (request.getIngredients() != null) {
      for (ProductIngredientRequest ingredient : request.getIngredients()) {
        addIngredientToProduct(product.getId(), ingredient.getIngredientId(),
            ingredient.getQuantityNeeded());

      }
    }

    return mapToResponse(product);
  }

  public void addIngredientToProduct(UUID productId, UUID ingredientId,
      BigDecimal quantityNeeded) {

    ProductIngredient productIngredient = new ProductIngredient();
    productIngredient.setId(new ProductIngredientId(productId, ingredientId));
    productIngredient.setQuantityNeeded(quantityNeeded);

    piRepo.save(productIngredient);
  }

  public void removeVariantToProduct(UUID productId, UUID ingredientId) {
    ProductIngredient productIngredient = new ProductIngredient();
    productIngredient.setId(new ProductIngredientId(productId, ingredientId));

    piRepo.delete(productIngredient);
  }

  public ProductResponse getProductById(UUID id) {
    Product product = repo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found"));
    return mapToResponse(product);
  }

  public Page<ProductResponse> getProducts(UUID storeId,
      int page,
      int size,
      String sortBy,
      String sortDir,
      String keyword,
      String categoryCode,
      LocalDate startDate,
      LocalDate endDate) {
    Pageable pageable = PageRequest.of(page, size,
        sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending());

    // fallback to 1970 and now if null
    LocalDateTime start = startDate != null ? startDate.atStartOfDay()
        : LocalDate.of(1970, 1, 1).atStartOfDay();
    LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

    Page<Product> productPage = repo.findFiltered(
        storeId, categoryCode, keyword, start, end, pageable);

    return productPage.map(this::mapToResponse);
  }

  public List<ProductResponse> getAllProducts() {
    return repo.findAll().stream()
        .map(this::mapToResponse)
        .toList();
  }

  private ProductResponse mapToResponse(Product product) {
    return ProductResponse.builder()
        .id(product.getId())
        .storeId(product.getStoreId())
        .name(product.getName())
        .imageUrl(product.getImageUrl())
        .description(product.getDescription())
        .stock(product.getStock())
        .rejectCount(product.getRejectCount())
        .soldCount(product.getSoldCount())
        .categoryCode(product.getCategoryCode())
        .measureUnitCode(product.getMeasureUnitCode())
        .buyingPrice(product.getBuyingPrice())
        .sellingPrice(product.getSellingPrice())
        .barcode(product.getBarcode())
        .commission(product.getCommission())
        .discount(product.getDiscount())
        .tax(product.getTax())
        .createdBy(product.getCreatedBy())
        .updatedBy(product.getUpdatedBy())
        .createdAt(product.getCreatedAt())
        .updatedAt(product.getUpdatedAt())
        .ingredients(product.getIngredients().stream()
            .map(pi -> ProductIngredientResponse.builder()
                .ingredientId(pi.getIngredient().getId())
                .name(pi.getIngredient().getName())
                .description(pi.getIngredient().getDescription())
                .stock(pi.getIngredient().getStock())
                .measureUnitCode(pi.getIngredient().getMeasureUnitCode())
                .quantityNeeded(pi.getQuantityNeeded())
                .build())
            .toList())
        .build();
  }
}
