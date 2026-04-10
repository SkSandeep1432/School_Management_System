package com.school.admin.service;

import com.school.admin.dto.request.LoginRequest;
import com.school.admin.dto.request.RegisterParentRequest;
import com.school.admin.dto.response.AuthResponse;
import com.school.admin.entity.Parent;
import com.school.admin.entity.Student;
import com.school.admin.entity.User;
import com.school.admin.exception.BadRequestException;
import com.school.admin.repository.ParentRepository;
import com.school.admin.repository.StudentRepository;
import com.school.admin.repository.UserRepository;
import com.school.admin.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ParentRepository parentRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       UserRepository userRepository,
                       StudentRepository studentRepository,
                       ParentRepository parentRepository,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.parentRepository = parentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadRequestException("User not found"));

        return new AuthResponse(token, user.getRole().name(), user.getUsername(), user.getId());
    }

    @Transactional
    public AuthResponse registerParent(RegisterParentRequest request) {
        // Validate email exists in students table
        Student student = studentRepository.findByParentEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadRequestException("Email not registered in school records. Please use the same email entered by the admin for your child."));

        // Check email not already registered in users table
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        // Use email as username (industry standard for parent portal)
        String username = request.email();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("An account with this email already exists.");
        }

        // Create User with PARENT role
        User user = User.builder()
                .username(username)
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(User.Role.PARENT)
                .build();
        user = userRepository.save(user);

        // Create Parent record linked to the student
        Parent parent = Parent.builder()
                .user(user)
                .student(student)
                .fullName(request.fullName())
                .build();
        parentRepository.save(parent);

        // Authenticate to generate token
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, request.password())
        );
        String token = jwtTokenProvider.generateToken(authentication);

        return new AuthResponse(token, user.getRole().name(), user.getUsername(), user.getId());
    }
}
