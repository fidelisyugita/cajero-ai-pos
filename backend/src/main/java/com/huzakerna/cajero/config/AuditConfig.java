package com.huzakerna.cajero.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
public class AuditConfig {
  // AuditorAware bean is already defined as a @Component in AuditorAwareImpl.java
  // Spring will pick it up by type or we can reference it by name if needed.
  // simpler to just refer to it if there is only one.
}
