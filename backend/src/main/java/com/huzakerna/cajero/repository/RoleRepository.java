package com.huzakerna.cajero.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import com.huzakerna.cajero.model.Role;

public interface RoleRepository extends JpaRepository<Role, String> {

}
