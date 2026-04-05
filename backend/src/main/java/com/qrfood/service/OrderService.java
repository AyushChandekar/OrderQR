package com.qrfood.service;

import com.qrfood.dto.OrderRequest;
import com.qrfood.dto.OrderResponse;
import com.qrfood.dto.PaymentVerifyRequest;
import com.qrfood.dto.RazorpayOrderResponse;
import com.qrfood.entity.FoodOrder;
import com.qrfood.entity.MenuItem;
import com.qrfood.entity.OrderItem;
import com.qrfood.entity.RestaurantTable;
import com.qrfood.repository.MenuItemRepository;
import com.qrfood.repository.OrderRepository;
import com.qrfood.repository.TableRepository;
import com.razorpay.RazorpayException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final TableRepository tableRepository;
    private final PaymentService paymentService;

    private static final AtomicLong orderCounter = new AtomicLong(1000);

    public OrderService(OrderRepository orderRepository,
                        MenuItemRepository menuItemRepository,
                        TableRepository tableRepository,
                        PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.tableRepository = tableRepository;
        this.paymentService = paymentService;
    }

    /** Customer: create Razorpay order. tableId is the DB id of the table. */
    public RazorpayOrderResponse createRazorpayOrder(Long tableId, OrderRequest request) throws RazorpayException {
        // Resolve the table to validate it exists
        tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        double total = calculateTotal(request.getItems());
        return paymentService.createOrder(total);
    }

    /** Customer: verify payment and create order. */
    @Transactional
    public OrderResponse verifyPaymentAndCreateOrder(Long tableId, PaymentVerifyRequest request) {
        boolean isValid = paymentService.verifySignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!isValid) {
            throw new RuntimeException("Payment verification failed");
        }

        // Resolve table to get adminId and tableNumber
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        String orderId = "ORD-" + orderCounter.incrementAndGet();
        double totalAmount = calculateTotal(request.getItems());

        FoodOrder order = FoodOrder.builder()
                .adminId(table.getAdminId())
                .orderId(orderId)
                .tableNumber(table.getTableNumber())
                .totalAmount(totalAmount)
                .notes(request.getNotes())
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .razorpaySignature(request.getRazorpaySignature())
                .paymentStatus("PAID")
                .items(new ArrayList<>())
                .build();

        for (OrderRequest.OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + itemReq.getMenuItemId()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menuItemId(menuItem.getId())
                    .menuItemName(menuItem.getName())
                    .price(menuItem.getPrice())
                    .quantity(itemReq.getQuantity())
                    .notes(itemReq.getNotes())
                    .build();

            order.getItems().add(orderItem);
        }

        FoodOrder saved = orderRepository.save(order);
        return OrderResponse.from(saved);
    }

    /** Admin: get orders for this admin only. */
    public List<OrderResponse> getOrdersByAdmin(Long adminId) {
        return orderRepository.findByAdminIdOrderByCreatedAtDesc(adminId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    /** Admin: update status — only if order belongs to this admin. */
    public OrderResponse updateStatus(Long adminId, Long id, String status) {
        FoodOrder order = orderRepository.findByIdAndAdminId(id, adminId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<String> validStatuses = List.of("PENDING", "PREPARING", "SERVED", "COMPLETED");
        if (!validStatuses.contains(status.toUpperCase())) {
            throw new RuntimeException("Invalid status: " + status);
        }

        order.setStatus(status.toUpperCase());
        return OrderResponse.from(orderRepository.save(order));
    }

    private double calculateTotal(List<OrderRequest.OrderItemRequest> items) {
        double total = 0;
        for (OrderRequest.OrderItemRequest item : items) {
            MenuItem menuItem = menuItemRepository.findById(item.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found: " + item.getMenuItemId()));
            total += menuItem.getPrice() * item.getQuantity();
        }
        return total;
    }
}
