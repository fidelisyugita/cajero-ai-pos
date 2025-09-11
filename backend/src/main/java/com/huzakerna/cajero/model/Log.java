package com.huzakerna.cajero.model;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "logs")
public class Log {
  @Id
  @UuidGenerator(style = UuidGenerator.Style.TIME) // Modern UUID generation
  @Column(columnDefinition = "uuid DEFAULT uuid_generate_v4()")
  private UUID id;

  @Column(name = "store_id")
  private UUID storeId;

  private String type; // 'subscription', 'payment', 'inventory', 'user'
  private String action; // 'created', 'updated', 'deleted'

  // @Column(columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode details; // flexible: {"old_status":"pending","new_status":"success"}

  @Column(name = "created_at")
  private LocalDateTime createdAt;
}
