package com.huzakerna.cajero.model;

import jakarta.persistence.Cacheable;
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
@Cacheable
@Table(name = "transaction_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionType {

    @Id
    @Column(name = "code", length = 20)
    private String code; // e.g., "dine-in", "takeaway"

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Dine in", "Takeaway"

    private String description;
}
