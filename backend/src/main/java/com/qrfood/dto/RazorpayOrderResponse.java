package com.qrfood.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RazorpayOrderResponse {
    private String orderId;
    private Integer amount;
    private String currency;
    private String keyId;
}
