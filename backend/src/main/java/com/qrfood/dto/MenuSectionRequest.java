package com.qrfood.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class MenuSectionRequest {
    @NotBlank
    private String name;
    private String description;
    private Integer displayOrder;
}
