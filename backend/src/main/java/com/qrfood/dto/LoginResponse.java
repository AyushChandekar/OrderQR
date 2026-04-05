package com.qrfood.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
    private String token;
    private Long adminId;
    private String username;
    private String restaurantName;
}
