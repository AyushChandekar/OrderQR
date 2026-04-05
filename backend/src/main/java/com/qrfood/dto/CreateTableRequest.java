package com.qrfood.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CreateTableRequest {
    @NotNull
    @Min(1)
    private Integer numberOfTables;
}
