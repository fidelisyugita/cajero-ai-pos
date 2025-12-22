package com.huzakerna.cajero.model;

import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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

    @Column(name = "store_id")
    private UUID storeId;

    @Id
    @Column(name = "code", length = 10)
    private String code; // e.g., "KG", "L", "PC"

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Kilogram", "Liter", "Piece"

    private String description;
}
