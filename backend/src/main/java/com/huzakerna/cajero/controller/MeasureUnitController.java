package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.MeasureUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/measure-unit")
@RequiredArgsConstructor
public class MeasureUnitController {

    private final MeasureUnitRepository repo;
    private final MeasureUnitService service;

    @GetMapping
    public ResponseEntity<List<MeasureUnit>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(repo.findAll());
        // UUID storeId = user.getStoreId();

        // return ResponseEntity.ok(repo.findByStoreId(storeId));
    }

    @PostMapping
    public MeasureUnit add(@Valid @RequestBody MeasureUnit measureUnit) {

        return service.addMeasureUnit(measureUnit);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<MeasureUnit>> getById(@PathVariable String id) {
        return ResponseEntity.ok(repo.findById(id));
    }

}
