package com.huzakerna.cajero.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.repository.MeasureUnitRepository;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/measure-unit")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class MeasureUnitController {

    private final MeasureUnitRepository repo;

    @GetMapping
    public ResponseEntity<List<MeasureUnit>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @PostMapping
    public ResponseEntity<MeasureUnit> create(
            @Valid @RequestBody MeasureUnit measureUnit) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(repo.save(measureUnit));
    }
}
