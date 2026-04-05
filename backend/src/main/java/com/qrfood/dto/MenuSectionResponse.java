package com.qrfood.dto;

import com.qrfood.entity.MenuSection;
import lombok.*;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuSectionResponse {
    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private List<MenuItemResponse> items;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MenuItemResponse {
        private Long id;
        private String name;
        private String description;
        private Double price;
        private String imageUrl;
        private Boolean available;
        private Long sectionId;
    }

    public static MenuSectionResponse from(MenuSection section) {
        List<MenuItemResponse> itemList = section.getItems().stream()
                .map(item -> MenuItemResponse.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .description(item.getDescription())
                        .price(item.getPrice())
                        .imageUrl(item.getImageUrl())
                        .available(item.getAvailable())
                        .sectionId(section.getId())
                        .build())
                .toList();

        return MenuSectionResponse.builder()
                .id(section.getId())
                .name(section.getName())
                .description(section.getDescription())
                .displayOrder(section.getDisplayOrder())
                .items(itemList)
                .build();
    }
}
