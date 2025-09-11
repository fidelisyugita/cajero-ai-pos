package com.huzakerna.cajero.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.huzakerna.cajero.model.Log;

public interface LogRepository extends JpaRepository<Log, UUID> {

  List<Log> findByStoreId(UUID storeId);

  @Query("""
          SELECT l FROM Log l
          WHERE l.storeId = :storeId
            AND (:keyword IS NULL OR
              LOWER(l.type) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
              LOWER(l.action) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
            AND l.createdAt BETWEEN :start AND :end
      """)
  Page<Log> findFiltered(
      @Param("storeId") UUID storeId,
      @Param("keyword") String keyword,
      @Param("start") LocalDateTime start,
      @Param("end") LocalDateTime end,
      Pageable pageable);
}
