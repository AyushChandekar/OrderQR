package com.qrfood.repository;

import com.qrfood.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    boolean existsByTableNumber(Integer tableNumber);
    List<RestaurantTable> findByAdminId(Long adminId);
    boolean existsByAdminIdAndTableNumber(Long adminId, Integer tableNumber);
}
