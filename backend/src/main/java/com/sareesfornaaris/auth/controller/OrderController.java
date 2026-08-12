package com.sareesfornaaris.auth.controller;

import com.sareesfornaaris.auth.dto.MessageResponse;
import com.sareesfornaaris.auth.entity.CartItem;
import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.OrderItem;
import com.sareesfornaaris.auth.entity.OrderStatusHistory;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.CartItemRepository;
import com.sareesfornaaris.auth.repository.OrderItemRepository;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.OrderStatusHistoryRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import com.sareesfornaaris.auth.repository.UserRepository;
import com.sareesfornaaris.auth.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/address")
    public ResponseEntity<?> updateOrderAddress(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {

        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthenticated."));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getUserId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Unauthorized to edit this order."));
        }

        // Address lock condition: Address can ONLY be edited while in "Order Placed" or "CONFIRMED" initial stage
        String currentStatus = order.getStatus();
        if (!"Order Placed".equalsIgnoreCase(currentStatus) && !"CONFIRMED".equalsIgnoreCase(currentStatus) && !"PENDING".equalsIgnoreCase(currentStatus)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Address is locked and cannot be modified after order enters In Transit or Out for Delivery."));
        }

        String newAddress = body.get("addressSnapshot");
        if (newAddress != null && !newAddress.trim().isEmpty()) {
            order.setAddressSnapshot(newAddress);
            orderRepository.save(order);
            return ResponseEntity.ok(new MessageResponse("Order delivery address updated successfully."));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Invalid address provided."));
    }

    @PutMapping("/admin/{orderId}/status")
    @Transactional
    public ResponseEntity<?> updateOrderStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {

        if (userDetails == null || userDetails.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(new MessageResponse("Error: Admin access required."));
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        String newStatus = body.get("status");
        if (newStatus != null && !newStatus.trim().isEmpty()) {
            order.setStatus(newStatus);
            orderRepository.save(order);

            // Log timestamped history record
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .order(order)
                    .status(newStatus)
                    .changedAt(LocalDateTime.now())
                    .changedByUserId(userDetails.getId())
                    .build();
            orderStatusHistoryRepository.save(history);

            return ResponseEntity.ok(Map.of(
                    "message", "Order status updated to: " + newStatus,
                    "orderId", orderId,
                    "status", newStatus
            ));
        }

        return ResponseEntity.badRequest().body(new MessageResponse("Invalid status provided."));
    }

    @PostMapping("/create-cod")
    @Transactional
    public ResponseEntity<?> createCodOrder(@RequestBody Map<String, String> data,
                                             @AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(new MessageResponse("Error: Unauthorized"));
        }

        String addressSnapshot = data.get("address_snapshot");
        if (addressSnapshot == null || addressSnapshot.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Delivery address is required"));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (cartItems.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Cart is empty"));
        }

        BigDecimal totalAmount = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            if (cartItem.getQuantity() > product.getStock()) {
                return ResponseEntity.badRequest().body(new MessageResponse(
                        "Error: Insufficient stock for product: " + product.getName() + ". Available: " + product.getStock()));
            }
        }

        Order order = Order.builder()
                .orderId("ORD-" + System.currentTimeMillis())
                .user(user)
                .totalAmount(totalAmount)
                .status("Order Placed")
                .paymentMethod("COD")
                .paymentStatus("PENDING")
                .addressSnapshot(addressSnapshot)
                .createdAt(LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Record initial status history
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(savedOrder)
                .status("Order Placed")
                .changedAt(LocalDateTime.now())
                .changedByUserId(user.getUserId())
                .build();
        orderStatusHistoryRepository.save(history);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(product)
                    .pricePerUnit(product.getPrice())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .quantity(cartItem.getQuantity())
                    .build();
            orderItems.add(orderItem);
        }

        orderItemRepository.saveAll(orderItems);
        cartItemRepository.deleteAll(cartItems);

        return ResponseEntity.ok(Map.of(
                "message", "Order placed successfully with Cash on Delivery",
                "orderId", savedOrder.getOrderId(),
                "status", "Order Placed",
                "paymentStatus", "PENDING"
        ));
    }
}
