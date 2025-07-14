package com.huzakerna.cajero.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.TransactionStatus;
import com.huzakerna.cajero.repository.TransactionStatusRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment-method")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class TransactionStatusController {

    private final TransactionStatusRepository repo;

    @GetMapping
    public ResponseEntity<List<TransactionStatus>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }


}
