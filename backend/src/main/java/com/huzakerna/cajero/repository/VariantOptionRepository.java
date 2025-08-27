package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.VariantOption;

public interface VariantOptionRepository extends JpaRepository<VariantOption, UUID> {

  List<VariantOption> findByVariantId(UUID variantId);
}
