package com.huzakerna.cajero.dto.store;

import com.huzakerna.cajero.model.Store;
import com.huzakerna.cajero.model.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateStoreWithUserRequest {

  @NotNull
  @Valid
  private Store store;

  @NotNull
  @Valid
  private User user;
}
