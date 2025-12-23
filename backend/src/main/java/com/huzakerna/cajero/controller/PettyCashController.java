package com.huzakerna.cajero.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.PettyCash;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.PettyCashService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/petty-cash")
@RequiredArgsConstructor
public class PettyCashController {

    private final PettyCashService service;

    @GetMapping
    public ResponseEntity<Page<PettyCash>> getAll(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        UUID storeId = user.getStoreId();
        return ResponseEntity.ok(service.getAllPettyCashs(storeId, page, size, sortBy, sortDir, startDate, endDate));
    }

    @PostMapping
    public PettyCash add(@AuthenticationPrincipal UserDetailsImpl user, @RequestBody PettyCash request) {

        UUID storeId = user.getStoreId();
        return service.addPettyCash(storeId, request);
    }

    @PutMapping("/{id}")
    public PettyCash update(@AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable UUID id, @RequestBody PettyCash request) {

        UUID storeId = user.getStoreId();
        return service.updatePettyCash(storeId, id, request);
    }

    @GetMapping("/{id}")
    public PettyCash getById(@PathVariable UUID id) {
        return service.getPettyCashById(id);
    }
}
