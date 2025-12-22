package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.MeasureUnit;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MeasureUnitRepository extends JpaRepository<MeasureUnit, String> {

  @Query("SELECT m FROM MeasureUnit m WHERE m.storeId = :storeId OR m.storeId IS NULL")
  List<MeasureUnit> findAllByStoreIdIncludingGlobal(@Param("storeId") UUID storeId);
}
