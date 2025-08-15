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

import com.huzakerna.cajero.dto.TransactionRequest;
import com.huzakerna.cajero.dto.TransactionResponse;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class TransactionController {

  private final TransactionService service; // Must be final for Lombok

  @GetMapping
  public ResponseEntity<Page<TransactionResponse>> getAll(
      @AuthenticationPrincipal UserDetailsImpl user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "id") String sortBy,
      @RequestParam(defaultValue = "asc") String sortDir,
      @RequestParam(required = false) String statusCode,
      @RequestParam(required = false) String transactionTypeCode,
      @RequestParam(required = false) String paymentMethodCode,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

    UUID storeId = user.getStoreId();

    return ResponseEntity.ok(service.getTransactions(
        storeId, page, size, sortBy, sortDir, statusCode, transactionTypeCode,
        paymentMethodCode, startDate, endDate));
  }

  @PostMapping
  public TransactionResponse add(@Valid @RequestBody TransactionRequest request) {
    return service.addTransaction(request);
  }

  @GetMapping("/{id}")
  public ResponseEntity<TransactionResponse> getById(@PathVariable UUID id) {
    return ResponseEntity.ok(service.getTransactionById(id));
  }

}
