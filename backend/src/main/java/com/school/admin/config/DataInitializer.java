package com.school.admin.config;

import com.school.admin.entity.User;
import com.school.admin.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepository.existsByUsername("sandeeprcb18@gmail.com")) {
            User admin = User.builder()
                    .username("sandeeprcb18@gmail.com")
                    .password(passwordEncoder.encode("Sandeep@123"))
                    .email("sandeeprcb18@gmail.com")
                    .role(User.Role.ADMIN)
                    .build();
            userRepository.save(admin);
            log.info("Admin user seeded: sandeeprcb18@gmail.com");
        } else {
            log.info("Admin user already exists, skipping seed.");
        }
    }
}
