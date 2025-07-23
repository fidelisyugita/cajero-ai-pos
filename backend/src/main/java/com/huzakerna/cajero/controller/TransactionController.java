package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
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
    public ResponseEntity<List<TransactionResponse>> getAll(
        @AuthenticationPrincipal UserDetailsImpl user) {
        UUID storeId = user.getStoreId();

        return ResponseEntity.ok(service.getTransactionsByStoreId(storeId));
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
