package com.huzakerna.cajero.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Store;
import java.util.Optional;
import java.util.UUID;

public interface StoreRepository extends JpaRepository<Store, UUID> {
  Optional<Store> findByEmail(String email);

  boolean existsByEmail(String email);
}
