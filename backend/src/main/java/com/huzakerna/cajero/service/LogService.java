package com.huzakerna.cajero.service;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huzakerna.cajero.model.Log;
import com.huzakerna.cajero.repository.LogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogService {
  private final LogRepository logRepository;
  private final ObjectMapper objectMapper;

  public void logAction(UUID storeId, String type, String action, Object details) {
    try {
      String jsonDetails = objectMapper.writeValueAsString(details);
      Log log = Log.builder()
          .storeId(storeId)
          .type(type)
          .action(action)
          .details(jsonDetails)
          .createdAt(LocalDateTime.now())
          .build();
      logRepository.save(log);
    } catch (Exception e) {
      // Log error but don't throw to prevent disrupting main operation
      e.printStackTrace();
    }
  }
}
