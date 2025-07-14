package com.huzakerna.cajero.repository;


import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Variant;

public interface VariantRepository extends JpaRepository<Variant, UUID> {

}
