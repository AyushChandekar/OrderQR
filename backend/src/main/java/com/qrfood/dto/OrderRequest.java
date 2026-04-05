package com.qrfood.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class OrderRequest {

    @NotNull
    private Integer tableNumber;

    @NotEmpty
    private List<OrderItemRequest> items;

    private String notes;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemRequest {
        @NotNull
        private Long menuItemId;

        @NotNull
        @Min(1)
        private Integer quantity;

        private String notes;
    }
}
