package com.huzakerna.cajero.config;

import com.oracle.bmc.ConfigFileReader;
import com.oracle.bmc.auth.ConfigFileAuthenticationDetailsProvider;
import com.oracle.bmc.auth.SimpleAuthenticationDetailsProvider;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.ObjectStorageClient;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.IOException;

@Configuration
@Getter
public class OracleCloudConfig {

  @Value("${oracle.cloud.configFilePath}")
  private String configFilePath;

  @Value("${oracle.cloud.bucket.name}")
  private String bucketName;

  @Value("${oracle.cloud.compartment.id}")
  private String compartmentId;

  @Value("${oracle.cloud.namespace}")
  private String namespace;

  @Value("${oracle.cloud.region}")
  private String region;

  @Bean
  public ObjectStorage objectStorageClient() throws Exception {
    final ConfigFileReader.ConfigFile configFile = ConfigFileReader.parse(configFilePath);
    final ConfigFileAuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(configFile);

    return ObjectStorageClient.builder()
        .build(provider);
  }

  // @Bean
  // public AuthenticationDetailsProvider authenticationDetailsProvider() throws
  // IOException {
  // return new ConfigFileAuthenticationDetailsProvider(configFilePath);
  // }

  // @Bean
  // public ObjectStorage objectStorageClient(AuthenticationDetailsProvider
  // authenticationDetailsProvider) {
  // return ObjectStorageClient.builder()
  // .build(authenticationDetailsProvider);
  // }
}
