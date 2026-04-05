package com.qrfood.service;

import com.qrfood.dto.TableInfoResponse;
import com.qrfood.entity.Admin;
import com.qrfood.entity.RestaurantTable;
import com.qrfood.repository.AdminRepository;
import com.qrfood.repository.TableRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TableService {

    private final TableRepository tableRepository;
    private final AdminRepository adminRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    public TableService(TableRepository tableRepository, AdminRepository adminRepository) {
        this.tableRepository = tableRepository;
        this.adminRepository = adminRepository;
    }

    public List<RestaurantTable> createTables(Long adminId, int numberOfTables) {
        List<RestaurantTable> tables = new ArrayList<>();

        for (int i = 1; i <= numberOfTables; i++) {
            if (!tableRepository.existsByAdminIdAndTableNumber(adminId, i)) {
                RestaurantTable table = RestaurantTable.builder()
                        .adminId(adminId)
                        .tableNumber(i)
                        .build();
                table = tableRepository.save(table);
                // QR URL uses table database ID (globally unique)
                table.setQrCodeUrl(frontendUrl + "/menu/" + table.getId());
                table = tableRepository.save(table);
                tables.add(table);
            }
        }
        return tables;
    }

    public List<RestaurantTable> getTablesByAdmin(Long adminId) {
        return tableRepository.findByAdminId(adminId);
    }

    /** Public: returns table info + restaurant name for customers. */
    public TableInfoResponse getTableInfo(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        Admin admin = adminRepository.findById(table.getAdminId())
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return TableInfoResponse.builder()
                .id(table.getId())
                .adminId(table.getAdminId())
                .tableNumber(table.getTableNumber())
                .restaurantName(admin.getRestaurantName())
                .build();
    }
}
