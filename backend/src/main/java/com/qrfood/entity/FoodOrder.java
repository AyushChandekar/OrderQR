package com.qrfood.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "food_orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long adminId;

    @Column(unique = true, nullable = false)
    private String orderId;

    @Column(nullable = false)
    private Integer tableNumber;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Double totalAmount;

    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private String status = "PENDING";

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    @Column(nullable = false)
    @Builder.Default
    private String paymentStatus = "PENDING";
}
