package com.huzakerna.cajero.service;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.huzakerna.cajero.dto.ProductRequest;
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

        public Product addProduct(ProductRequest request) {
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
                if (request.getProductVariants() != null) {
                        for (ProductVariant variant : request.getProductVariants()) {
                                addVariantToProduct(product.getId(), variant.getId().getVariantId(),
                                        variant.getPriceAdjustment(), variant.getStockQuantity());

                        }
                }

                return product;

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

        public Product getProductById(UUID id) {
                return repo.findById(id)
                        .orElseThrow(() -> new RuntimeException("Product not found"));
        }
}
