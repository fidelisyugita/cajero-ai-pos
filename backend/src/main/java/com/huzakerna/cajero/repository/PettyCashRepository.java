package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.huzakerna.cajero.model.PettyCash;
import java.util.List;
import java.util.UUID;

@Repository
public interface PettyCashRepository extends JpaRepository<PettyCash, UUID> {

    List<PettyCash> findByStoreId(UUID storeId);
}
