package com.huzakerna.cajero.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    @GetMapping
    public List<UserResponse> getAll() {
        return service.getAllUsers();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse add(@AuthenticationPrincipal UserDetailsImpl user, @Valid @RequestBody UserRequest request) {

        UUID storeId = user.getStoreId();
        return service.addUser(storeId, request);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable UUID id) {
        return service.getUserById(id);
    }
}
