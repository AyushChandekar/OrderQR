package com.qrfood.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "restaurant_tables",
       uniqueConstraints = @UniqueConstraint(columnNames = {"admin_id", "table_number"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "table_number", nullable = false)
    private Integer tableNumber;

    private String qrCodeUrl;
}
