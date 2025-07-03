package com.huzakerna.cajero.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.MeasureUnit;

public interface MeasureUnitRepository extends JpaRepository<MeasureUnit, String> {

    // Finds by code (ID)
    Optional<MeasureUnit> findByCode(String code);
}
