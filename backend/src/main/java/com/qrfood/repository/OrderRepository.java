package com.qrfood.repository;

import com.qrfood.entity.FoodOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<FoodOrder, Long> {
    Optional<FoodOrder> findByOrderId(String orderId);
    Optional<FoodOrder> findByRazorpayOrderId(String razorpayOrderId);
    List<FoodOrder> findAllByOrderByCreatedAtDesc();
    List<FoodOrder> findByAdminIdOrderByCreatedAtDesc(Long adminId);
    Optional<FoodOrder> findByIdAndAdminId(Long id, Long adminId);
}
