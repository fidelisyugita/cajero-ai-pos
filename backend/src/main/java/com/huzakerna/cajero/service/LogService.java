package com.huzakerna.cajero.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.huzakerna.cajero.model.Log;
import com.huzakerna.cajero.repository.LogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogService {
  private final LogRepository repo;
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
      repo.save(log);
    } catch (Exception e) {
      // Log error but don't throw to prevent disrupting main operation
      e.printStackTrace();
    }
  }

  public Page<Log> getLogs(UUID storeId,
      int page,
      int size,
      String sortBy,
      String sortDir,
      String keyword,
      LocalDate startDate,
      LocalDate endDate) {
    Pageable pageable = PageRequest.of(page, size,
        sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).descending()
            : Sort.by(sortBy).ascending());

    // fallback to 1970 and now if null
    LocalDateTime start = startDate != null ? startDate.atStartOfDay()
        : LocalDate.of(1970, 1, 1).atStartOfDay();
    LocalDateTime end = endDate != null ? endDate.atTime(LocalTime.MAX) : LocalDateTime.now();

    Page<Log> productPage = repo.findFiltered(
        storeId, keyword, start, end, pageable);

    return productPage;
  }

}
