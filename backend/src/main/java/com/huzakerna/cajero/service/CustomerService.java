package com.huzakerna.cajero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.huzakerna.cajero.model.Customer;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.util.ChangeTracker;

import jakarta.persistence.EntityNotFoundException;

import com.huzakerna.cajero.repository.CustomerRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository repo;
    private final StoreRepository sRepo;
    private final LogService logService;

    public Customer addCustomer(UUID storeId, Customer request) {

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }

        Customer customer = Customer.builder()
                .storeId(storeId)
                .name(request.getName())
                .phone(request.getPhone())
                .imageUrl(request.getImageUrl())
                .build();

        Customer savedCustomer = repo.save(customer);
        return (savedCustomer);
    }

    public Customer updateCustomer(UUID storeId, UUID id, Customer request) {

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }
        // Find existing transaction
        Customer customer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Verify the transaction belongs to the store
        if (!customer.getStoreId().equals(storeId)) {
            throw new IllegalArgumentException("Customer does not belong to the store");
        }

        // Create log details
        var logDetails = new java.util.HashMap<String, Object>();
        logDetails.put("customerId", id);

        // Create change tracker
        ChangeTracker changeTracker = new ChangeTracker();
        // Compare and store only changed values
        changeTracker.compareAndTrack("name", customer.getName(), request.getName());
        changeTracker.compareAndTrack("phone", customer.getPhone(),
                request.getPhone());
        changeTracker.compareAndTrack("imageUrl", customer.getImageUrl(),
                request.getImageUrl());
        changeTracker.compareAndTrack("totalPoint", customer.getTotalPoint(), request.getTotalPoint());
        changeTracker.compareAndTrack("totalTransaction", customer.getTotalTransaction(),
                request.getTotalTransaction());

        customer.setName(request.getName());
        customer.setPhone(request.getPhone());
        customer.setImageUrl(request.getImageUrl());
        customer.setTotalPoint(request.getTotalPoint());
        customer.setTotalTransaction(request.getTotalTransaction());

        customer = repo.save(customer);

        // Only add oldValues and newValues to log details if there were changes
        if (changeTracker.hasChanges()) {
            logService.logAction(storeId, "customer", "updated", customer.getId(), customer.getName(),
                    changeTracker.getChanges());
        }

        return (customer);
    }

    public Customer updateCustomer(UUID storeId, UUID id, BigDecimal addedPoints) {

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }
        // Find existing transaction
        Customer customer = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Verify the transaction belongs to the store
        if (!customer.getStoreId().equals(storeId)) {
            throw new IllegalArgumentException("Customer does not belong to the store");
        }

        customer.setTotalPoint(customer.getTotalPoint().add(addedPoints));
        customer.setTotalTransaction(customer.getTotalTransaction() + 1);

        customer = repo.save(customer);

        return (customer);
    }

    public Customer getCustomerById(UUID id) {
        Customer customer = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        return (customer);
    }

    public List<Customer> getAllCustomers() {
        return repo.findAll();
    }

}
