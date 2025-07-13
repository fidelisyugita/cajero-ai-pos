package com.huzakerna.cajero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.dto.UserResponse;
import com.huzakerna.cajero.exception.DuplicateEmailException;
import com.huzakerna.cajero.exception.UserNotFoundException;
import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder; // Autowired via constructor

        @Transactional
        public UserResponse createUser(UserRequest request) {
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new DuplicateEmailException(request.getEmail());
                }

                User user = User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .role(request.getRole())
                        .passwordHash(passwordEncoder.encode(request.getPassword()))
                        .imageUrl(request.getImageUrl())
                        .address(request.getAddress())
                        .description(request.getDescription())
                        .bankAccount(request.getBankAccount())
                        .bankNo(request.getBankNo())
                        .dailySalary(request.getDailySalary())
                        .overtimeRate(request.getOvertimeRate())
                        .build();

                User savedUser = userRepository.save(user);
                return mapToResponse(savedUser);
        }

        public UserResponse getUserById(UUID id) {
                User user = userRepository.findById(id)
                        .orElseThrow(() -> new UserNotFoundException(id));
                return mapToResponse(user);
        }

        public List<UserResponse> getAllUsers() {
                return userRepository.findAll().stream()
                        .map(this::mapToResponse)
                        .toList();
        }

        private UserResponse mapToResponse(User user) {
                return UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .role(user.getRole())
                        .imageUrl(user.getImageUrl())
                        .createdAt(user.getCreatedAt())
                        .build();
        }
}
