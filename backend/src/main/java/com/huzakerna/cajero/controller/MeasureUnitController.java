package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.dto.ProductRequest;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.Product;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.service.MeasureUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/measure-unit")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class MeasureUnitController {

    private final MeasureUnitRepository repo;
    private final MeasureUnitService service;

    @GetMapping
    public ResponseEntity<List<MeasureUnit>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<MeasureUnit>> getById(@PathVariable String id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @GetMapping("/store/{id}")
    public ResponseEntity<List<MeasureUnit>> getAllByStoreId(@PathVariable UUID id) {
        return ResponseEntity.ok(repo.findByStoreId(id));
    }

    @PostMapping
    public MeasureUnit add(@Valid @RequestBody MeasureUnit measureUnit) {
        return service.addMeasureUnit(measureUnit);
    }
}
