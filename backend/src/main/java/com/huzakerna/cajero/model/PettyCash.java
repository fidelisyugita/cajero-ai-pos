package com.huzakerna.cajero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "petty_cash")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PettyCash extends BaseEntity {

    @Column(name = "store_id")
    private UUID storeId;

    private BigDecimal amount;

    @Column(name = "is_income")
    private Boolean isIncome;
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    private String description;

}
