package com.huzakerna.cajero.model;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Transient;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@MappedSuperclass
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEntity {
  @Id
  @UuidGenerator(style = UuidGenerator.Style.TIME) // Modern UUID generation
  @Column(columnDefinition = "uuid DEFAULT uuid_generate_v4()")
  private UUID id;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;
  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "created_by", updatable = false)
  private UUID createdBy;
  @Column(name = "updated_by")
  private UUID updatedBy;

  @Column(name = "deleted_at")
  private LocalDateTime deletedAt;

  @Transient
  private String createdByName;
  @Transient
  private String updatedByName;
}
