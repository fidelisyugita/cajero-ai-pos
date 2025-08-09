package com.huzakerna.cajero.controller;

import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/image")
@RequiredArgsConstructor
public class ImageController {

  private final StorageService storageService;

  @PostMapping("/product-upload")
  @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'ADMIN')")
  public ResponseEntity<String> uploadProductImage(
      @RequestParam("file") MultipartFile file,
      @AuthenticationPrincipal UserDetailsImpl userDetails) {
    String imageUrl = storageService.uploadImage(file, userDetails.getStoreId(), "product");
    return ResponseEntity.ok(imageUrl);
  }

  @GetMapping(value = "/{storeId}/{prefix}/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public ResponseEntity<byte[]> getImage(
      @PathVariable String storeId,
      @PathVariable String prefix,
      @PathVariable String filename) {
    String objectName = String.format("%s/%s/%s", storeId, prefix, filename);
    byte[] imageData = storageService.downloadImage(objectName);
    return ResponseEntity.ok().body(imageData);
  }
}
