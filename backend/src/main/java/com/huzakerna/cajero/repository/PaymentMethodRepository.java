package com.huzakerna.cajero.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.huzakerna.cajero.model.PaymentMethod;

public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, String> {

}
