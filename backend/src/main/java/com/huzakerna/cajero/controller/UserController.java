package com.huzakerna.cajero.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.dto.UserResponse;
import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.UserService;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        if (adminSecretKey.equals(secretKey)) {
            return ResponseEntity.ok(service.getAllUsers());
        }

        if (user != null) {
            return ResponseEntity.ok(service.getUsersByStoreId(user.getStoreId()));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        boolean isAdmin = adminSecretKey.equals(secretKey);

        if (isAdmin) {
            return ResponseEntity.ok(service.getUserById(id));
        }

        if (user != null) {
            UserResponse response = service.getUserById(id);
            if (response.getStoreId().equals(user.getStoreId())) {
                return ResponseEntity.ok(response);
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserRequest request,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        boolean isAdmin = adminSecretKey.equals(secretKey);

        if (isAdmin) {
            // For admin, we might need to know which store to update against,
            // but updateUser requires storeId for validation.
            // Typically admin can do anything.
            // We can fetch the user first to get storeId.
            UserResponse existing = service.getUserById(id);
            return ResponseEntity.ok(service.updateUser(existing.getStoreId(), id, request));
        }

        if (user != null) {
            // Check if target user is in same store (handled by service if we pass storeId,
            // but service throws exception if mismatch.
            // Better to check here or rely on service. Service checks match.
            // So if we pass user.getStoreId(), service will ensure user belongs to that
            // store.
            return ResponseEntity.ok(service.updateUser(user.getStoreId(), id, request));
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse add(@AuthenticationPrincipal UserDetailsImpl user, @Valid @RequestBody UserRequest request) {

        UUID storeId = user.getStoreId();
        return service.addUser(storeId, request);
    }

}
