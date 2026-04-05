package com.qrfood.service;

import com.qrfood.dto.LoginRequest;
import com.qrfood.dto.LoginResponse;
import com.qrfood.dto.SignupRequest;
import com.qrfood.entity.Admin;
import com.qrfood.repository.AdminRepository;
import com.qrfood.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(AdminRepository adminRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(admin.getUsername());

        return LoginResponse.builder()
                .token(token)
                .adminId(admin.getId())
                .username(admin.getUsername())
                .restaurantName(admin.getRestaurantName())
                .build();
    }

    public LoginResponse signup(SignupRequest request) {
        if (adminRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        Admin admin = Admin.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .restaurantName(request.getRestaurantName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        admin = adminRepository.save(admin);

        String token = jwtUtil.generateToken(admin.getUsername());

        return LoginResponse.builder()
                .token(token)
                .adminId(admin.getId())
                .username(admin.getUsername())
                .restaurantName(admin.getRestaurantName())
                .build();
    }

    /** Resolve admin from JWT username — used by controllers. */
    public Admin getAdminByUsername(String username) {
        return adminRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }
}
