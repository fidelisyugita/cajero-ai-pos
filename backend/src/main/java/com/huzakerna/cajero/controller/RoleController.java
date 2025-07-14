package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.repository.RoleRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/role")
@RequiredArgsConstructor // Lombok generates constructor with required args
public class RoleController {

    private final RoleRepository repo;

    @GetMapping
    public ResponseEntity<List<Role>> getAll() {
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Optional<Role>> getRoleById(@PathVariable String id) {
        return ResponseEntity.ok(repo.findById(id));
    }

    @PostMapping
    public ResponseEntity<Role> create(
        @Valid @RequestBody Role role) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(repo.save(role));
    }
}
