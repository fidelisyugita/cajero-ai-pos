package com.huzakerna.cajero.model;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.databind.JsonNode;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import lombok.EqualsAndHashCode;

@Data
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "logs")
@EqualsAndHashCode(callSuper = true)
public class Log extends BaseEntity {

  private String type; // 'subscription', 'payment', 'inventory', 'user'
  private String action; // 'created', 'updated', 'deleted'

  // @Column(columnDefinition = "jsonb")
  @JdbcTypeCode(SqlTypes.JSON)
  private JsonNode details; // flexible: {"old_status":"pending","new_status":"success", "{model}_id":
                            // "uuid"}
}
