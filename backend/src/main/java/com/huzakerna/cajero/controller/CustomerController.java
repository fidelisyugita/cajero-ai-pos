package com.huzakerna.cajero.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.Customer;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.CustomerService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService service;

    @GetMapping
    public List<Customer> getAll() {
        return service.getAllCustomers();
    }

    @PostMapping
    public Customer add(@AuthenticationPrincipal UserDetailsImpl user, @RequestBody Customer request) {

        UUID storeId = user.getStoreId();
        return service.addCustomer(storeId, request);
    }

    @GetMapping("/{id}")
    public Customer getById(@PathVariable UUID id) {
        return service.getCustomerById(id);
    }
}
