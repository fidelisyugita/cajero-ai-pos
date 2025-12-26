package com.huzakerna.cajero.service;

import com.huzakerna.cajero.dto.store.CreateStoreWithUserRequest;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.model.User;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreService {

  private final StoreRepository storeRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Transactional
  public Store createStoreWithUser(CreateStoreWithUserRequest request) {
    // 1. Save Store
    Store store = request.getStore();
    Store savedStore = storeRepository.save(store);

    // 2. Prepare User (Owner)
    User user = request.getUser();
    user.setStoreId(savedStore.getId());
    user.setRoleCode("OWNER");
    user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash())); // Encoding password

    // 3. Save User
    userRepository.save(user);

    return savedStore;
  }
}
