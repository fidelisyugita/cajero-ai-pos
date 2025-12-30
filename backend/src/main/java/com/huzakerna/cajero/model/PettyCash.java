package com.huzakerna.cajero.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import java.math.BigDecimal;

@Entity
@Table(name = "petty_cash")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class PettyCash extends BaseEntity {

    private BigDecimal amount;

    @Column(name = "is_income")
    private Boolean isIncome;
    @Column(name = "image_url", length = 255)
    private String imageUrl;

    private String description;

}
