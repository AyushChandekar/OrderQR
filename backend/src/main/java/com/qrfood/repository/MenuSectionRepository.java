package com.qrfood.repository;

import com.qrfood.entity.MenuSection;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MenuSectionRepository extends JpaRepository<MenuSection, Long> {
    List<MenuSection> findAllByOrderByDisplayOrderAsc();
    List<MenuSection> findByAdminIdOrderByDisplayOrderAsc(Long adminId);
    Optional<MenuSection> findByIdAndAdminId(Long id, Long adminId);
}
