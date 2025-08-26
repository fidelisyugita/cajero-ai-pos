package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.MeasureUnit;

public interface MeasureUnitRepository extends JpaRepository<MeasureUnit, String> {

  // List<MeasureUnit> findByStoreId(UUID storeId);
}
