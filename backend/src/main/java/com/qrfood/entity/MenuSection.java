package com.qrfood.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "menu_sections")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long adminId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("name ASC")
    @Builder.Default
    private List<MenuItem> items = new ArrayList<>();
}
