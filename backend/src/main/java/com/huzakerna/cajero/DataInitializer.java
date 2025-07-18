package com.huzakerna.cajero;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.repository.RoleRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.service.UserService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final StoreRepository sRepo;
  private final RoleRepository rRepo;
  private final UserService userService;

  @Value("${admin.email}")
  String email;
  @Value("${admin.password}")
  String password;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    if (sRepo.count() == 0) {
      Store store = Store.builder()
        .name("Main Store")
        .email("main@store.com")
        .build();
      UUID storeId = sRepo.save(store).getId();

      List<Role> roles = List.of(
        Role.builder().code("OWNER").name("Store Owner").build(),
        Role.builder().code("MANAGER").name("Store Manager").build(),
        Role.builder().code("ADMIN").name("Administrator").build(),
        Role.builder().code("CASHIER").name("Cashier").build(),
        Role.builder().code("STAFF").name("Staff").build());
      rRepo.saveAll(roles);

      UserRequest user = UserRequest.builder()
        .name("Main Admin")
        .email(email)
        .password(password)
        .roleCode("ADMIN")
        .storeId(storeId)
        .build();
      userService.addUser(user);
    }
  }
}
