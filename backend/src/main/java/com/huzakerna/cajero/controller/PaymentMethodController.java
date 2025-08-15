package com.huzakerna.cajero.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.PaymentMethod;
import com.huzakerna.cajero.repository.PaymentMethodRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payment-method")
@RequiredArgsConstructor
public class PaymentMethodController {

    private final PaymentMethodRepository repo;

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

}
