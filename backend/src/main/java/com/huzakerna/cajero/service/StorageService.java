package com.huzakerna.cajero.service;

import com.huzakerna.cajero.config.OracleCloudConfig;
import com.huzakerna.cajero.exception.StorageException;
import com.oracle.bmc.objectstorage.ObjectStorage;
import com.oracle.bmc.objectstorage.requests.GetObjectRequest;
import com.oracle.bmc.objectstorage.requests.PutObjectRequest;
import com.oracle.bmc.objectstorage.responses.GetObjectResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

  private final ObjectStorage objectStorage;
  private final OracleCloudConfig config;

  // private static final DateTimeFormatter DATE_FORMAT =
  // DateTimeFormatter.ofPattern("yyyy/MM/dd");

  public String uploadImage(MultipartFile file, UUID storeId, String prefix) {
    try {
      String filename = generateUniqueFilename(file.getOriginalFilename(), storeId, prefix);

      PutObjectRequest request = PutObjectRequest.builder()
          .bucketName(config.getBucketName())
          .namespaceName(config.getNamespace())
          .objectName(filename)
          .contentType(file.getContentType())
          .putObjectBody(file.getInputStream())
          .build();

      objectStorage.putObject(request);

      // Return the public URL
      return String.format("https://objectstorage.%s.oraclecloud.com/n/%s/b/%s/o/%s",
          config.getRegion(),
          config.getNamespace(),
          config.getBucketName(),
          filename);

    } catch (IOException e) {
      throw new StorageException("Failed to store file " + file.getOriginalFilename(), e);
    }
  }

  public byte[] downloadImage(String objectName) {
    try {
      GetObjectRequest request = GetObjectRequest.builder()
          .bucketName(config.getBucketName())
          .namespaceName(config.getNamespace())
          .objectName(objectName)
          .build();

      GetObjectResponse response = objectStorage.getObject(request);
      return response.getInputStream().readAllBytes();

    } catch (Exception e) {
      throw new StorageException("Failed to download file " + objectName, e);
    }
  }

  private String generateUniqueFilename(String originalFilename, UUID storeId, String prefix) {
    String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
    return String.format("%s/%s/%s%s",
        storeId.toString(),
        prefix,
        UUID.randomUUID().toString(),
        extension);
  }
}
