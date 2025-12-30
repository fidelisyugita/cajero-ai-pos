package com.huzakerna.cajero.controller;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.huzakerna.cajero.dto.store.CreateStoreWithUserRequest;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.service.StoreService;
import com.huzakerna.cajero.security.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreRepository repo;
    private final StoreService storeService;

    @Value("${admin.secret-key}")
    private String adminSecretKey;

    @GetMapping
    public ResponseEntity<List<Store>> getAll(
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        log.info("StoreController.getAll called");

        if (adminSecretKey.equals(secretKey)) {
            log.info("Admin access granted");
            return ResponseEntity.ok(repo.findAll());
        }

        if (user.getStoreId() != null) {
            log.info("User access granted for store: {}", user.getStoreId());
            return ResponseEntity.ok(
                    repo.findById(user.getStoreId())
                            .map(List::of)
                            .orElse(List.of()));
        }

        log.warn("Access denied: User is null");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Store> getById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        log.info("StoreController.getById called for ID: {}", id);

        boolean isAdmin = adminSecretKey.equals(secretKey);
        boolean isOwner = user.getStoreId().equals(id);

        if (isAdmin || isOwner) {
            return repo.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        }

        log.warn("Access denied: isAdmin={}, isOwner={}", isAdmin, isOwner);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('OWNER', 'MANAGER')")
    public ResponseEntity<Store> update(
            @Valid @RequestBody Store store,
            @RequestHeader(value = "X-Admin-Secret", required = false) String secretKey,
            @AuthenticationPrincipal UserDetailsImpl user) {

        log.info("StoreController.update called");

        // For update, typically we need an ID.
        // Assuming the store object comes with an ID or we determine it from context.
        // If store has no ID, we can't update.
        // Let's assume store.getId() works if it extends BaseEntity which it does.

        if (store.getId() == null) {
            log.error("Update failed: Store ID is missing");
            return ResponseEntity.badRequest().build();
        }

        boolean isAdmin = adminSecretKey.equals(secretKey);
        boolean isOwner = user.getStoreId().equals(store.getId());

        if (isAdmin || isOwner) {
            log.info("Update authorized for store: {}", store.getId());
            return ResponseEntity.ok(repo.save(store));
        }

        log.warn("Update access denied: isAdmin={}, isOwner={}", isAdmin, isOwner);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    @PostMapping("/admin")
    public ResponseEntity<Store> createStoreWithUser(
            @RequestHeader("X-Admin-Secret") String secretKey,
            @Valid @RequestBody CreateStoreWithUserRequest request) {

        if (!adminSecretKey.equals(secretKey)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(storeService.createStoreWithUser(request));
    }
}
