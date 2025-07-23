package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.dto.ProductVariantRequest;
import com.huzakerna.cajero.dto.ProductVariantResponse;
import com.huzakerna.cajero.dto.ProductResponse;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.model.ProductVariant;
import com.huzakerna.cajero.model.ProductVariantId;
import com.huzakerna.cajero.repository.ProductRepository;
import com.huzakerna.cajero.repository.ProductVariantRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor // Lombok will auto-inject the dependency
public class ProductService {

        private final StoreRepository sRepo;
        private final ProductRepository repo;
        private final ProductVariantRepository pvRepo;

        public ProductResponse addProduct(ProductRequest request) {
                // Validate store exists
                if (!sRepo.existsById(request.getStoreId())) {
                        throw new IllegalArgumentException("Store not found");
                } ;
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
                                .stockQuantity(request.getStockQuantity())
                                .categoryCode(request.getCategoryCode())
                                .measureUnitCode(request.getMeasureUnitCode())
                                // Set other fields
                                .build());

                // Add product variants if any
                if (request.getProductVariantRequests() != null) {
                        for (ProductVariantRequest variant : request.getProductVariantRequests()) {
                                addVariantToProduct(product.getId(), variant.getVariantId(),
                                        variant.getPriceAdjustment(), variant.getStockQuantity());

                        }
                }

                return mapToResponse(product);
        }

        public void addVariantToProduct(UUID productId, UUID variantId,
                BigDecimal priceAdjustment, Integer stockQuantity) {

                ProductVariant productVariant = new ProductVariant();
                productVariant.setId(new ProductVariantId(productId, variantId));
                productVariant.setPriceAdjustment(priceAdjustment);
                productVariant.setStockQuantity(stockQuantity);

                pvRepo.save(productVariant);
        }

        public void removeVariantToProduct(UUID productId, UUID variantId) {
                ProductVariant productVariant = new ProductVariant();
                productVariant.setId(new ProductVariantId(productId, variantId));

                pvRepo.delete(productVariant);
        }

        public ProductResponse getProductById(UUID id) {
                Product product = repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
                return mapToResponse(product);
        }

        public List<ProductResponse> getProductsByStoreId(UUID id) {
                return repo.findByStoreId(id).stream()
                        .map(this::mapToResponse)
                        .toList();
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
                        .stockQuantity(product.getStockQuantity())
                        .rejectCount(product.getRejectCount())
                        .soldCount(product.getSoldCount())
                        .categoryCode(product.getCategoryCode())
                        .measureUnitCode(product.getMeasureUnitCode())
                        .buyingPrice(product.getBuyingPrice())
                        .sellingPrice(product.getSellingPrice())
                        .isCommissionByPercent(product.isCommissionByPercent())
                        .commission(product.getCommission())
                        .createdBy(product.getCreatedBy())
                        .updatedBy(product.getUpdatedBy())
                        .createdAt(product.getCreatedAt())
                        .updatedAt(product.getUpdatedAt())
                        .productVariants(product.getProductVariants().stream()
                                .map(pv -> ProductVariantResponse.builder()
                                        .variantId(pv.getVariant().getId())
                                        .storeId(pv.getProduct().getStoreId())
                                        .name(pv.getVariant().getName())
                                        .description(pv.getVariant().getDescription())
                                        .isRequired(pv.getVariant().isRequired())
                                        .isMultiple(pv.getVariant().isMultiple())
                                        .options(pv.getVariant().getOptions())
                                        .stockQuantity(pv.getStockQuantity())
                                        .priceAdjustment(pv.getPriceAdjustment())
                                        .build())
                                .toList())
                        .build();
        }
}
