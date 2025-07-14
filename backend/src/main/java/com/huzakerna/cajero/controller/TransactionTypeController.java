package com.huzakerna.cajero.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.TransactionType;
import com.huzakerna.cajero.repository.TransactionTypeRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment-method")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class TransactionTypeController {

    private final TransactionTypeRepository repo;

    @GetMapping
    public ResponseEntity<List<TransactionType>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }


}
