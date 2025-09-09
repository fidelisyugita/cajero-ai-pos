package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.VariantRequest;
import com.huzakerna.cajero.dto.VariantResponse;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.VariantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/variant")
@RequiredArgsConstructor
public class VariantController {

  private final VariantService service;

  @GetMapping
  public ResponseEntity<List<VariantResponse>> getAll(
      @AuthenticationPrincipal UserDetailsImpl user) {
    UUID storeId = user.getStoreId();

    return ResponseEntity.ok(service.getAllByStoreId(storeId));
  }

  @PostMapping
  public VariantResponse add(@AuthenticationPrincipal UserDetailsImpl user,
      @Valid @RequestBody VariantRequest variant) {

    UUID storeId = user.getStoreId();

    return service.addVariant(storeId, variant);
  }

  @GetMapping("/{id}")
  public ResponseEntity<VariantResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(service.getVariantById(id));
  }

  @PutMapping("/{id}")
  public ResponseEntity<VariantResponse> update(
      @AuthenticationPrincipal UserDetailsImpl user,
      @PathVariable UUID id,
      @Valid @RequestBody VariantRequest request) {
    UUID storeId = user.getStoreId();
    return ResponseEntity.ok(service.updateVariant(storeId, id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<VariantResponse> deleteById(
      @AuthenticationPrincipal UserDetailsImpl user, @PathVariable UUID id) {
    UUID storeId = user.getStoreId();
    return ResponseEntity.ok(service.removeVariant(storeId, id));
  }

}
