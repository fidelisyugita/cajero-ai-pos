package com.huzakerna.cajero.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.huzakerna.cajero.security.UserDetailsImpl;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtUtils {

  @Value("${jwt.secret-key}")
  private String jwtSecret;

  @Value("${jwt.expiration-ms}")
  private int jwtExpirationMs;

  public String extractUsername(String token) {
    return extractClaim(token, Claims::getSubject);
  }

  public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
    final Claims claims = extractAllClaims(token);
    return claimsResolver.apply(claims);
  }


  public String generateToken(UserDetailsImpl userDetails) {
    return Jwts.builder()
      .subject(userDetails.getUsername())
      .issuedAt(new Date())
      .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
      .signWith(getSigningKey())
      .compact();
  }

  // public String generateToken(UserDetailsImpl userDetails) {
  // return generateToken(new HashMap<>(), userDetails);
  // }

  // @SuppressWarnings("deprecation")
  // public String generateToken(
  // Map<String, Object> extraClaims,
  // UserDetails userDetails) {
  // return Jwts.builder()
  // .setClaims(extraClaims)
  // .setSubject(userDetails.getUsername())
  // .setIssuedAt(new Date(System.currentTimeMillis()))
  // .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
  // .signWith(getSigningKey(), SignatureAlgorithm.HS256)
  // .compact();
  // }

  public boolean isTokenValid(String token, UserDetails userDetails) {
    final String username = extractUsername(token);
    return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
  }

  private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
  }

  private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
  }

  @SuppressWarnings("deprecation")
  private Claims extractAllClaims(String token) {
    return Jwts
      .parser()
      .setSigningKey(getSigningKey())
      .build()
      .parseClaimsJws(token)
      .getBody();
  }

  private Key getSigningKey() {
    byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
    return Keys.hmacShaKeyFor(keyBytes);
  }
}
