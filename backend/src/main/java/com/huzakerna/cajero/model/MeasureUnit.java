package com.huzakerna.cajero.model;

import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "measure_units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeasureUnit {

    @Id
    @Column(name = "code", length = 10)
    private String code; // e.g., "KG", "L", "PC"

    @Transient
    private Store store;

    @Column(name = "store_id")
    private UUID storeId;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Kilogram", "Liter", "Piece"

    private String description;

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}
