package com.school.admin.config;

import com.school.admin.entity.Classes;
import com.school.admin.entity.Section;
import com.school.admin.entity.User;
import com.school.admin.repository.ClassesRepository;
import com.school.admin.repository.SectionRepository;
import com.school.admin.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ClassesRepository classesRepository;
    private final SectionRepository sectionRepository;

    public DataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           ClassesRepository classesRepository,
                           SectionRepository sectionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.classesRepository = classesRepository;
        this.sectionRepository = sectionRepository;
    }

    @Override
    public void run(String... args) {
        // Seed admin user
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

        // Seed classes 1 to 10
        if (classesRepository.count() == 0) {
            for (int i = 1; i <= 10; i++) {
                Classes cls = new Classes();
                cls.setClassName(String.valueOf(i));
                classesRepository.save(cls);
            }
            log.info("Classes 1-10 seeded.");
        } else {
            log.info("Classes already exist, skipping seed.");
        }

        // Seed sections A, B, C
        if (sectionRepository.count() == 0) {
            for (String name : List.of("A", "B", "C")) {
                Section sec = new Section();
                sec.setSectionName(name);
                sectionRepository.save(sec);
            }
            log.info("Sections A, B, C seeded.");
        } else {
            log.info("Sections already exist, skipping seed.");
        }
    }
}
