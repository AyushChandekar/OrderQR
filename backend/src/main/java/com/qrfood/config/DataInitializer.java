package com.qrfood.config;

import com.qrfood.entity.Admin;
import com.qrfood.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.username}")
    private String defaultUsername;

    @Value("${admin.default.password}")
    private String defaultPassword;

    @Value("${admin.default.restaurant}")
    private String defaultRestaurant;

    public DataInitializer(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!adminRepository.existsByUsername(defaultUsername)) {
            Admin admin = Admin.builder()
                    .username(defaultUsername)
                    .password(passwordEncoder.encode(defaultPassword))
                    .restaurantName(defaultRestaurant)
                    .build();
            adminRepository.save(admin);
            System.out.println("Default admin created: " + defaultUsername);
        }
    }
}
