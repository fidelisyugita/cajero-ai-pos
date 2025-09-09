package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.huzakerna.cajero.model.Log;
import com.huzakerna.cajero.repository.LogRepository;
import com.huzakerna.cajero.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/log")
@RequiredArgsConstructor
public class LogController {

  private final LogRepository repo;

  @GetMapping
  public ResponseEntity<List<Log>> getAll(
      @AuthenticationPrincipal UserDetailsImpl user) {
    UUID storeId = user.getStoreId();

    return ResponseEntity.ok(repo.findByStoreId(storeId));
  }

}
