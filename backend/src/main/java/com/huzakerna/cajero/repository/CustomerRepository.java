package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.huzakerna.cajero.model.Customer;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByPhone(String phone);

    @EntityGraph(attributePaths = { "createdBy", "updatedBy" })
    List<Customer> findByStoreId(UUID storeId);
}
