package com.huzakerna.cajero.model;

import java.util.UUID;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "variants")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Variant extends BaseEntity {

    @Column(name = "store_id")
    private UUID storeId;

    @Column(nullable = false, length = 50)
    private String name; // e.g., "Sugar", "Topping", "Ice Level"

    private String description;
    @Column(name = "is_required")
    private boolean isRequired;
    @Column(name = "is_multiple")
    private boolean isMultiple;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private JsonNode options;

    @Column(name = "created_By")
    private UUID createdBy;
    @Column(name = "updated_By")
    private UUID updatedBy;

}
