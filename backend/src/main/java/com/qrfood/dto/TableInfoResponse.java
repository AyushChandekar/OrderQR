package com.qrfood.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TableInfoResponse {
    private Long id;
    private Long adminId;
    private Integer tableNumber;
    private String restaurantName;
}
