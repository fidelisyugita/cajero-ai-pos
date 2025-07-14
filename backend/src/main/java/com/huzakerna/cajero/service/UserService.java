package com.huzakerna.cajero.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.dto.UserResponse;
import com.huzakerna.cajero.exception.DuplicateEmailException;
import com.huzakerna.cajero.exception.UserNotFoundException;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.RoleRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

        private final UserRepository repo;
        private final StoreRepository sRepo;
        private final RoleRepository rRepo;
        private final PasswordEncoder passwordEncoder; // Autowired via constructor

        @Transactional
        public UserResponse createUser(UserRequest request) {
                if (repo.existsByEmail(request.getEmail())) {
                        throw new DuplicateEmailException(request.getEmail());
                }

                Store store = sRepo.findById(request.getStoreId())
                        .orElseThrow(
                                () -> new EntityNotFoundException("Store not found"));

                Role role = rRepo.findById(request.getRoleCode())
                        .orElseThrow(
                                () -> new EntityNotFoundException("Role not found"));


                User user = User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .phone(request.getPhone())
                        .store(store)
                        .role(role)
                        .passwordHash(passwordEncoder.encode(request.getPassword()))
                        .imageUrl(request.getImageUrl())
                        .address(request.getAddress())
                        .description(request.getDescription())
                        .bankAccount(request.getBankAccount())
                        .bankNo(request.getBankNo())
                        .dailySalary(request.getDailySalary())
                        .overtimeRate(request.getOvertimeRate())
                        .build();

                User savedUser = repo.save(user);
                return mapToResponse(savedUser);
        }

        public UserResponse getUserById(UUID id) {
                User user = repo.findById(id)
                        .orElseThrow(() -> new UserNotFoundException(id));
                return mapToResponse(user);
        }

        public List<UserResponse> getAllUsers() {
                return repo.findAll().stream()
                        .map(this::mapToResponse)
                        .toList();
        }

        private UserResponse mapToResponse(User user) {
                return UserResponse.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .phone(user.getPhone())
                        .storeId(user.getStore().getId())
                        .roleCode(user.getRole().getCode())
                        .imageUrl(user.getImageUrl())
                        .createdAt(user.getCreatedAt())
                        .updatedAt(user.getUpdatedAt())
                        .build();
        }
}
