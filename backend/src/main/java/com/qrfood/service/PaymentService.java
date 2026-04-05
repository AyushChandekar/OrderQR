package com.qrfood.service;

import com.qrfood.dto.RazorpayOrderResponse;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(keyId, keySecret);
    }

    public RazorpayOrderResponse createOrder(double amount) throws RazorpayException {
        JSONObject options = new JSONObject();
        // Razorpay expects amount in paise
        options.put("amount", (int) (amount * 100));
        options.put("currency", "INR");
        options.put("receipt", "order_" + System.currentTimeMillis());

        Order razorpayOrder = razorpayClient.orders.create(options);

        return RazorpayOrderResponse.builder()
                .orderId(razorpayOrder.get("id"))
                .amount(razorpayOrder.get("amount"))
                .currency(razorpayOrder.get("currency"))
                .keyId(keyId)
                .build();
    }

    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            return Utils.verifyPaymentSignature(attributes, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
