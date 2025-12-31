package com.huzakerna.cajero.model;

import java.io.Serializable;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.EqualsAndHashCode;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VariantOptionIngredientId implements Serializable {
    @Column(name = "ingredient_id")
    private UUID ingredientId;
    @Column(name = "variant_option_id")
    private UUID variantOptionId;

}
