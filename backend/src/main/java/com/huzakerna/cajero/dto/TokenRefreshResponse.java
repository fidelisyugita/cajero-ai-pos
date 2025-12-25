package com.huzakerna.cajero.dto;

import lombok.Builder;

@Builder
public record TokenRefreshResponse(String accessToken, String refreshToken) {
}
