package com.huzakerna.cajero.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.StockUpdateRequest;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.StockMovementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stock-update")
@RequiredArgsConstructor
public class StockUpdateController {

  private final StockMovementService stockMovementService;

  @PostMapping
  public ResponseEntity<Void> updateStock(
      @AuthenticationPrincipal UserDetailsImpl user,
      @Valid @RequestBody StockUpdateRequest request) {

    stockMovementService.adjustStock(user.getStoreId(), request);
    return ResponseEntity.ok().build();
  }
}
