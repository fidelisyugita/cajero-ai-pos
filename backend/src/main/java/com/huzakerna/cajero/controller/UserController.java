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
            @RequestHeader("X-Admin-Secret") String secretKey) {

        if (!adminSecretKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(service.getAllUsers());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse add(@AuthenticationPrincipal UserDetailsImpl user, @Valid @RequestBody UserRequest request) {

        UUID storeId = user.getStoreId();
        return service.addUser(storeId, request);
    }

}
