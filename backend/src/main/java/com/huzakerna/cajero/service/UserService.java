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
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.UserRepository;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;
    private final StoreRepository sRepo;
    private final PasswordEncoder encoder; // Autowired via constructor

    @Transactional
    public UserResponse addUser(UUID storeId, UserRequest request) {
        if (repo.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }

        // Validate store exists
        if (!sRepo.existsById(storeId)) {
            throw new IllegalArgumentException("Store not found");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .storeId(storeId)
                .roleCode(request.getRoleCode())
                .passwordHash(encoder.encode(request.getPassword()))
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
                .storeId(user.getStoreId())
                .roleCode(user.getRoleCode())
                .imageUrl(user.getImageUrl())
                .build();
    }
}
