package com.qrfood.controller;

import com.qrfood.dto.OrderRequest;
import com.qrfood.dto.OrderResponse;
import com.qrfood.dto.PaymentVerifyRequest;
import com.qrfood.dto.RazorpayOrderResponse;
import com.qrfood.service.AuthService;
import com.qrfood.service.OrderService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final AuthService authService;

    public OrderController(OrderService orderService, AuthService authService) {
        this.orderService = orderService;
        this.authService = authService;
    }

    /** Customer: create Razorpay order for a table (public). */
    @PostMapping("/create-razorpay-order/{tableId}")
    public ResponseEntity<?> createRazorpayOrder(@PathVariable Long tableId,
                                                  @Valid @RequestBody OrderRequest request) {
        try {
            RazorpayOrderResponse response = orderService.createRazorpayOrder(tableId, request);
            return ResponseEntity.ok(response);
        } catch (RazorpayException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create payment order"));
        }
    }

    /** Customer: verify payment and create order (public). */
    @PostMapping("/verify-payment/{tableId}")
    public ResponseEntity<?> verifyPayment(@PathVariable Long tableId,
                                            @Valid @RequestBody PaymentVerifyRequest request) {
        try {
            OrderResponse response = orderService.verifyPaymentAndCreateOrder(tableId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Admin: get only this admin's orders. */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(Principal principal) {
        Long adminId = authService.getAdminByUsername(principal.getName()).getId();
        return ResponseEntity.ok(orderService.getOrdersByAdmin(adminId));
    }

    /** Admin: update status — scoped to this admin's orders. */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Principal principal) {
        try {
            Long adminId = authService.getAdminByUsername(principal.getName()).getId();
            OrderResponse response = orderService.updateStatus(adminId, id, body.get("status"));
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
