package com.huzakerna.cajero.config;

import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.RoleRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final StoreRepository storeRepository;
  private final RoleRepository roleRepository;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    if (storeRepository.count() == 0) {
      Store store = Store.builder()
        .name("Main Store")
        .email("main@store.com")
        .phone("+123456789")
        .build();
      storeRepository.save(store);

      List<Role> roles = List.of(
        Role.builder().code("OWNER").name("Store Owner").build(),
        Role.builder().code("ADMIN").name("Administrator").build(),
        Role.builder().code("MANAGER").name("Store Manager").build(),
        Role.builder().code("CASHIER").name("Cashier").build(),
        Role.builder().code("STAFF").name("Staff").build());
      roleRepository.saveAll(roles);
    }
  }
}
