package com.huzakerna.cajero.controller;

import com.huzakerna.cajero.security.UserDetailsImpl;
import com.huzakerna.cajero.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
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

  @Operation(summary = "Upload a product image", description = "Upload an image file for a product. Supports JPG, PNG, and GIF formats.", responses = {
      @ApiResponse(responseCode = "200", description = "Image successfully uploaded", content = @Content(mediaType = "text/plain", schema = @Schema(type = "string", format = "uri"))),
      @ApiResponse(responseCode = "400", description = "Invalid file format or size"),
      @ApiResponse(responseCode = "401", description = "Unauthorized"),
      @ApiResponse(responseCode = "403", description = "Forbidden - Insufficient permissions")
  })
  @PostMapping(value = "/product-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @PreAuthorize("hasAnyRole('OWNER', 'MANAGER', 'ADMIN')")
  public ResponseEntity<String> uploadProductImage(
      @Parameter(description = "Image file to upload (max 10MB, formats: JPG, PNG, GIF)", required = true, content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)) @RequestParam("file") MultipartFile file,
      @Parameter(hidden = true) @AuthenticationPrincipal UserDetailsImpl userDetails) {
    String imageUrl = storageService.uploadImage(file, "product", userDetails.getStoreId());
    return ResponseEntity.ok(imageUrl);
  }

  @Operation(summary = "Get an image by path", description = "Retrieve an image by its store ID, prefix, and filename", responses = {
      @ApiResponse(responseCode = "200", description = "Image found and returned", content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE)),
      @ApiResponse(responseCode = "404", description = "Image not found")
  })
  @GetMapping(value = "/{prefix}/{storeId}/{filename}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public ResponseEntity<byte[]> getImage(
      @Parameter(description = "Image category (e.g., 'product', 'profile')", example = "product") @PathVariable String prefix,
      @Parameter(description = "Store ID", example = "123e4567-e89b-12d3-a456-426614174000") @PathVariable String storeId,
      @Parameter(description = "Image filename with extension", example = "image123.jpg") @PathVariable String filename) {
    String objectName = String.format("%s/%s/%s", prefix, storeId, filename);
    byte[] imageData = storageService.downloadImage(objectName);
    return ResponseEntity.ok().body(imageData);
  }
}
