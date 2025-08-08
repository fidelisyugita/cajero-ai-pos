package com.huzakerna.cajero;

import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.huzakerna.cajero.dto.UserRequest;
import com.huzakerna.cajero.model.MeasureUnit;
import com.huzakerna.cajero.model.PaymentMethod;
import com.huzakerna.cajero.model.ProductCategory;
import com.huzakerna.cajero.model.Role;
import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.model.TransactionStatus;
import com.huzakerna.cajero.model.TransactionType;
import com.huzakerna.cajero.repository.MeasureUnitRepository;
import com.huzakerna.cajero.repository.PaymentMethodRepository;
import com.huzakerna.cajero.repository.ProductCategoryRepository;
import com.huzakerna.cajero.repository.RoleRepository;
import com.huzakerna.cajero.repository.StoreRepository;
import com.huzakerna.cajero.repository.TransactionStatusRepository;
import com.huzakerna.cajero.repository.TransactionTypeRepository;
import com.huzakerna.cajero.service.UserService;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final StoreRepository sRepo;
  private final RoleRepository rRepo;
  private final UserService userService;
  private final MeasureUnitRepository muRepo;
  private final ProductCategoryRepository pcRepo;
  private final TransactionTypeRepository ttRepo;
  private final TransactionStatusRepository tsRepo;
  private final PaymentMethodRepository pmRepo;

  @Value("${admin.email}")
  String email;
  @Value("${admin.password}")
  String password;

  @Override
  @Transactional
  public void run(String... args) throws Exception {
    if (sRepo.count() == 0) {
      Store store = Store.builder()
          .name("System Store")
          .email("sytem@store.com")
          .build();
      UUID storeId = sRepo.save(store).getId();

      List<Role> roles = List.of(
          Role.builder().code("ADMIN").name("System Administrator").build(),
          Role.builder().code("OWNER").name("Store Owner").build(),
          Role.builder().code("MANAGER").name("Store Manager").build(),
          Role.builder().code("CASHIER").name("Store Cashier").build(),
          Role.builder().code("STAFF").name("Store Staff").build());
      rRepo.saveAll(roles);

      UserRequest user = UserRequest.builder()
          .name("Main Admin")
          .email(email)
          .password(password)
          .roleCode("ADMIN")
          .storeId(storeId)
          .build();
      userService.addUser(user);

      List<MeasureUnit> measureUnits = List.of(
          MeasureUnit.builder().code("PCS").name("Pieces").description("Individual items").storeId(storeId).build(),
          MeasureUnit.builder().code("G").name("Gram").description("Weight measurement").storeId(storeId).build(),
          MeasureUnit.builder().code("ML").name("Mililiter").description("Volume measurement").storeId(storeId).build(),
          MeasureUnit.builder().code("MM").name("Milimeter").description("Length measurement").storeId(storeId)
              .build());
      muRepo.saveAll(measureUnits);

      List<ProductCategory> productCategories = List.of(
          ProductCategory.builder().code("FOOD").name("Food").description("Food items").storeId(storeId).build(),
          ProductCategory.builder().code("SNACK").name("Snack").description("Snack items").storeId(storeId).build(),
          ProductCategory.builder().code("DRINK").name("Drink").description("Drink items").storeId(storeId).build());
      pcRepo.saveAll(productCategories);

      List<TransactionType> transactionTypes = List.of(
          TransactionType.builder().code("DINEIN").name("Dine in").description("Dine in").build(),
          TransactionType.builder().code("TAKEAWAY").name("Take away").description("Take away").build());
      ttRepo.saveAll(transactionTypes);

      List<TransactionStatus> transactionStatuses = List.of(
          TransactionStatus.builder().code("PENDING").name("Pending").description("Transaction pending / on progess")
              .build(),
          TransactionStatus.builder().code("COMPLETED").name("Completed").description("Transaction completed").build(),
          TransactionStatus.builder().code("CANCELLED").name("Cancelled").description("Transaction cancelled").build(),
          TransactionStatus.builder().code("REFUNDED").name("Refunded").description("Transaction refunded").build());
      tsRepo.saveAll(transactionStatuses);

      List<PaymentMethod> paymentMethods = List.of(
          PaymentMethod.builder().code("CASH").name("Cash").build(),
          PaymentMethod.builder().code("QR").name("QR Code").build(),
          PaymentMethod.builder().code("DEBIT").name("Debit").build(),
          PaymentMethod.builder().code("CREDIT").name("Credit").build());
      pmRepo.saveAll(paymentMethods);
    }
  }
}
