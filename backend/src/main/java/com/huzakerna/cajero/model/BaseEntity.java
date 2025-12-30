package com.huzakerna.cajero.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import jakarta.persistence.EntityListeners;

@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseEntity {
  @Id
  @UuidGenerator(style = UuidGenerator.Style.TIME) // Modern UUID generation
  @Column(columnDefinition = "uuid DEFAULT uuid_generate_v4()")
  private UUID id;

  @Column(name = "store_id")
  private UUID storeId;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @JsonIgnore
  @CreatedBy
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "created_by", updatable = false)
  private User createdBy;

  @JsonIgnore
  @LastModifiedBy
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "updated_by")
  private User updatedBy;

  @JsonProperty("createdBy")
  public UUID getCreatedById() {
    return createdBy != null ? createdBy.getId() : null;
  }

  @JsonProperty("createdByName")
  public String getCreatedByName() {
    return createdBy != null ? createdBy.getName() : null;
  }

  @JsonProperty("updatedBy")
  public UUID getUpdatedById() {
    return updatedBy != null ? updatedBy.getId() : null;
  }

  @JsonProperty("updatedByName")
  public String getUpdatedByName() {
    return updatedBy != null ? updatedBy.getName() : null;
  }

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;
}
