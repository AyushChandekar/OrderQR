package com.qrfood.controller;

import com.qrfood.dto.CreateTableRequest;
import com.qrfood.dto.TableInfoResponse;
import com.qrfood.entity.RestaurantTable;
import com.qrfood.service.AuthService;
import com.qrfood.service.TableService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    private final TableService tableService;
    private final AuthService authService;

    public TableController(TableService tableService, AuthService authService) {
        this.tableService = tableService;
        this.authService = authService;
    }

    @PostMapping
    public ResponseEntity<List<RestaurantTable>> createTables(@Valid @RequestBody CreateTableRequest request, Principal principal) {
        Long adminId = authService.getAdminByUsername(principal.getName()).getId();
        return ResponseEntity.ok(tableService.createTables(adminId, request.getNumberOfTables()));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getMyTables(Principal principal) {
        Long adminId = authService.getAdminByUsername(principal.getName()).getId();
        return ResponseEntity.ok(tableService.getTablesByAdmin(adminId));
    }

    /** Public: customer fetches table info (includes restaurant name). */
    @GetMapping("/{id}")
    public ResponseEntity<TableInfoResponse> getTableInfo(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getTableInfo(id));
    }
}
