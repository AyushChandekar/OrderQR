package com.qrfood.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SignupRequest {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotBlank
    private String restaurantName;
    private String email;
    private String phone;
}
