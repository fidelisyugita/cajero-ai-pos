package com.huzakerna.cajero.dto;

import java.time.Instant;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public abstract class BaseResponse {
  private UUID id;
  private UUID storeId;

  private UUID createdBy;
  private String createdByName;
  private UUID updatedBy;
  private String updatedByName;

  private Instant createdAt;
  private Instant updatedAt;
  private Instant deletedAt;
}
