package com.qrfood.repository;

import com.qrfood.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByAvailableTrue();
    List<MenuItem> findByAdminIdAndAvailableTrue(Long adminId);
    List<MenuItem> findByAdminId(Long adminId);
    Optional<MenuItem> findByIdAndAdminId(Long id, Long adminId);
    boolean existsByIdAndAdminId(Long id, Long adminId);
}
