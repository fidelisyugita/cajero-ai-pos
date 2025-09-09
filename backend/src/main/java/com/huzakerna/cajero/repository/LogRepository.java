package com.huzakerna.cajero.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Log;

public interface LogRepository extends JpaRepository<Log, UUID> {

  List<Log> findByStoreId(UUID storeId);
}
