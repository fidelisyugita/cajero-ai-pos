package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.dto.TransactionRequest;
import com.huzakerna.cajero.model.Transaction;
import com.huzakerna.cajero.repository.TransactionRepository;
import com.huzakerna.cajero.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transaction")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class TransactionController {

    private final TransactionRepository repo;
    private final TransactionService service; // Must be final for Lombok

    @GetMapping
    public List<Transaction> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public Transaction add(@Valid @RequestBody TransactionRequest request) {
        return service.addTransaction(request);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(service.getTransactionById(id));
    }

    @GetMapping("/store/{id}")
    public ResponseEntity<List<Transaction>> getAllByStoreId(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findByStoreId(id));
    }
}
