package com.huzakerna.cajero.controller;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.Log;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.LogService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class LogController {

  private final LogService service;

  // @GetMapping
  // public ResponseEntity<List<Log>> getAll(
  // @AuthenticationPrincipal UserDetailsImpl user) {
  // UUID storeId = user.getStoreId();
  // return ResponseEntity.ok(repo.findByStoreId(storeId));
  // }

  @GetMapping
  public ResponseEntity<Page<Log>> getAll(
      @AuthenticationPrincipal UserDetailsImpl user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(defaultValue = "createdAt") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir,
      @RequestParam(defaultValue = "") String keyword,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

    UUID storeId = user.getStoreId();

    return ResponseEntity.ok(service.getLogs(
        storeId, page, size, sortBy, sortDir, keyword, startDate, endDate));

  }

}
