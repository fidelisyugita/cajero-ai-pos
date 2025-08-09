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

import java.io.ByteArrayInputStream;
import java.io.File;
import java.util.Base64;

import com.oracle.bmc.Region;

@Configuration
@Getter
@Slf4j
public class OracleCloudConfig {

  @Value("${oracle.cloud.configFilePath:#{null}}")
  private String configFilePath;

  @Value("${oracle.cloud.bucket.name}")
  private String bucketName;

  @Value("${oracle.cloud.compartment.id}")
  private String compartmentId;

  @Value("${oracle.cloud.namespace}")
  private String namespace;

  @Value("${oracle.cloud.region}")
  private String region;

  @Value("${oracle.cloud.tenancy}")
  private String tenancyId;

  @Value("${oracle.cloud.user}")
  private String userId;

  @Value("${oracle.cloud.fingerprint.base64}")
  private String fingerprintBase64;

  @Value("${oracle.cloud.privatekey.base64:#{null}}")
  private String privateKeyBase64;

  private String getDecodedFingerprint() {
    return new String(Base64.getDecoder().decode(fingerprintBase64));
  }

  private String getDecodedPrivateKey() {
    return new String(Base64.getDecoder().decode(privateKeyBase64));
  }

  @Bean
  public ObjectStorage objectStorageClient() throws Exception {
    if (configFilePath != null && new File(configFilePath).exists()) {
      // Use config file if available
      final ConfigFileReader.ConfigFile configFile = ConfigFileReader.parse(configFilePath);
      final ConfigFileAuthenticationDetailsProvider provider = new ConfigFileAuthenticationDetailsProvider(configFile);
      return ObjectStorageClient.builder().build(provider);
    } else {
      // Use environment variables
      final SimpleAuthenticationDetailsProvider provider = SimpleAuthenticationDetailsProvider.builder()
          .tenantId(tenancyId)
          .userId(userId)
          .fingerprint(getDecodedFingerprint())
          .privateKeySupplier(() -> {
            try {
              return privateKeyBase64 != null ? new ByteArrayInputStream(getDecodedPrivateKey().getBytes())
                  : new ByteArrayInputStream(new byte[0]);
            } catch (Exception e) {
              throw new RuntimeException("Failed to read private key", e);
            }
          })
          .region(Region.fromRegionId(region))
          .build();
      return ObjectStorageClient.builder().build(provider);
    }
  }

}
