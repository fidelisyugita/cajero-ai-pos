package com.huzakerna.cajero.controller;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.dto.ProductResponse;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/product")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class ProductController {

  private final ProductService service; // Must be final for Lombok

  @GetMapping
  public ResponseEntity<Page<ProductResponse>> getAll(
      @AuthenticationPrincipal UserDetailsImpl user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "name") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir,
      @RequestParam(defaultValue = "") String keyword,
      @RequestParam(required = false) String categoryCode,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

    UUID storeId = user.getStoreId();

    return ResponseEntity.ok(service.getProducts(
        storeId, page, size, sortBy, sortDir, keyword, categoryCode, startDate, endDate));

  }

  @PostMapping
  public ProductResponse add(@AuthenticationPrincipal UserDetailsImpl user,
      @Valid @RequestBody ProductRequest request) {

    UUID storeId = user.getStoreId();
    return service.addProduct(storeId, request);
  }

  @GetMapping("/{id}")
  public ResponseEntity<ProductResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(service.getProductById(id));
  }
}
