package com.qrfood.controller;

import com.qrfood.dto.MenuItemRequest;
import com.qrfood.dto.MenuSectionRequest;
import com.qrfood.dto.MenuSectionResponse;
import com.qrfood.entity.MenuSection;
import com.qrfood.service.AuthService;
import com.qrfood.service.MenuService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    private final MenuService menuService;
    private final AuthService authService;

    public MenuController(MenuService menuService, AuthService authService) {
        this.menuService = menuService;
        this.authService = authService;
    }

    private Long adminId(Principal principal) {
        return authService.getAdminByUsername(principal.getName()).getId();
    }

    // ---- Sections ----

    @PostMapping("/sections")
    public ResponseEntity<?> createSection(@Valid @RequestBody MenuSectionRequest request, Principal principal) {
        try {
            MenuSection section = menuService.createSection(adminId(principal), request);
            return ResponseEntity.ok(section);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Admin: get own sections with items. */
    @GetMapping("/sections")
    public ResponseEntity<List<MenuSectionResponse>> getSections(
            @RequestParam(required = false) Long adminId, Principal principal) {
        // If adminId param is provided (customer flow), use it; otherwise use JWT
        Long resolvedAdminId = adminId != null ? adminId : adminId(principal);
        return ResponseEntity.ok(menuService.getSectionsByAdmin(resolvedAdminId));
    }

    /** Public: customer fetches a restaurant's menu by adminId. */
    @GetMapping("/sections/public")
    public ResponseEntity<List<MenuSectionResponse>> getPublicSections(@RequestParam Long adminId) {
        return ResponseEntity.ok(menuService.getSectionsForCustomer(adminId));
    }

    @PutMapping("/sections/{id}")
    public ResponseEntity<?> updateSection(@PathVariable Long id, @Valid @RequestBody MenuSectionRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(menuService.updateSection(adminId(principal), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<?> deleteSection(@PathVariable Long id, Principal principal) {
        try {
            menuService.deleteSection(adminId(principal), id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ---- Items ----

    @PostMapping
    public ResponseEntity<?> createItem(@Valid @RequestBody MenuItemRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(menuService.createItem(adminId(principal), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request, Principal principal) {
        try {
            return ResponseEntity.ok(menuService.updateItem(adminId(principal), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable Long id, Principal principal) {
        try {
            menuService.deleteItem(adminId(principal), id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
