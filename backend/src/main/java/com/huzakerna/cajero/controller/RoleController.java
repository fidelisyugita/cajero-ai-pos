package com.huzakerna.cajero.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.repository.RoleRepository;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository repo;

    @GetMapping
    public ResponseEntity<List<Role>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }
}
