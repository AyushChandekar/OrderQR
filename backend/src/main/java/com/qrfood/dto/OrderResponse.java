package com.qrfood.dto;

import com.qrfood.entity.FoodOrder;
import com.qrfood.entity.OrderItem;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OrderResponse {
    private Long id;
    private String orderId;
    private Integer tableNumber;
    private List<ItemResponse> items;
    private Double totalAmount;
    private String notes;
    private String status;
    private LocalDateTime createdAt;
    private String paymentStatus;
    private String razorpayPaymentId;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ItemResponse {
        private Long menuItemId;
        private String menuItemName;
        private Double price;
        private Integer quantity;
        private String notes;
    }

    public static OrderResponse from(FoodOrder order) {
        List<ItemResponse> itemResponses = order.getItems().stream()
                .map(item -> ItemResponse.builder()
                        .menuItemId(item.getMenuItemId())
                        .menuItemName(item.getMenuItemName())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .notes(item.getNotes())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderId(order.getOrderId())
                .tableNumber(order.getTableNumber())
                .items(itemResponses)
                .totalAmount(order.getTotalAmount())
                .notes(order.getNotes())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .paymentStatus(order.getPaymentStatus())
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .build();
    }
}
