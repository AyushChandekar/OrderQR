package com.qrfood.service;

import com.qrfood.dto.MenuItemRequest;
import com.qrfood.dto.MenuSectionRequest;
import com.qrfood.dto.MenuSectionResponse;
import com.qrfood.entity.MenuItem;
import com.qrfood.entity.MenuSection;
import com.qrfood.repository.MenuItemRepository;
import com.qrfood.repository.MenuSectionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuSectionRepository menuSectionRepository;

    public MenuService(MenuItemRepository menuItemRepository, MenuSectionRepository menuSectionRepository) {
        this.menuItemRepository = menuItemRepository;
        this.menuSectionRepository = menuSectionRepository;
    }

    // ---- Sections ----

    public MenuSection createSection(Long adminId, MenuSectionRequest request) {
        MenuSection section = MenuSection.builder()
                .adminId(adminId)
                .name(request.getName())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
        return menuSectionRepository.save(section);
    }

    /** Admin: get own sections */
    public List<MenuSectionResponse> getSectionsByAdmin(Long adminId) {
        return menuSectionRepository.findByAdminIdOrderByDisplayOrderAsc(adminId).stream()
                .map(MenuSectionResponse::from)
                .toList();
    }

    /** Public: get a restaurant's sections (for customer menu) */
    public List<MenuSectionResponse> getSectionsForCustomer(Long adminId) {
        return menuSectionRepository.findByAdminIdOrderByDisplayOrderAsc(adminId).stream()
                .map(section -> {
                    // Filter to available items only
                    MenuSectionResponse resp = MenuSectionResponse.from(section);
                    resp.setItems(resp.getItems().stream()
                            .filter(MenuSectionResponse.MenuItemResponse::getAvailable)
                            .toList());
                    return resp;
                })
                .filter(s -> !s.getItems().isEmpty())
                .toList();
    }

    public MenuSection updateSection(Long adminId, Long id, MenuSectionRequest request) {
        MenuSection section = menuSectionRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        section.setName(request.getName());
        section.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            section.setDisplayOrder(request.getDisplayOrder());
        }
        return menuSectionRepository.save(section);
    }

    @Transactional
    public void deleteSection(Long adminId, Long id) {
        MenuSection section = menuSectionRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new RuntimeException("Section not found"));
        for (MenuItem item : section.getItems()) {
            item.setSection(null);
        }
        menuItemRepository.saveAll(section.getItems());
        menuSectionRepository.delete(section);
    }

    // ---- Items ----

    public MenuItem createItem(Long adminId, MenuItemRequest request) {
        MenuItem item = MenuItem.builder()
                .adminId(adminId)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .imageUrl(request.getImageUrl())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .build();

        if (request.getSectionId() != null) {
            MenuSection section = menuSectionRepository.findByIdAndAdminId(request.getSectionId(), adminId)
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            item.setSection(section);
        }

        return menuItemRepository.save(item);
    }

    public MenuItem updateItem(Long adminId, Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setImageUrl(request.getImageUrl());
        item.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);

        if (request.getSectionId() != null) {
            MenuSection section = menuSectionRepository.findByIdAndAdminId(request.getSectionId(), adminId)
                    .orElseThrow(() -> new RuntimeException("Section not found"));
            item.setSection(section);
        } else {
            item.setSection(null);
        }

        return menuItemRepository.save(item);
    }

    public void deleteItem(Long adminId, Long id) {
        if (!menuItemRepository.existsByIdAndAdminId(id, adminId)) {
            throw new RuntimeException("Menu item not found");
        }
        menuItemRepository.deleteById(id);
    }
}
