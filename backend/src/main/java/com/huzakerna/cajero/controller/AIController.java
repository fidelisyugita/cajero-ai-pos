package com.huzakerna.cajero.controller;

import com.huzakerna.cajero.dto.AIRequest;
import com.huzakerna.cajero.dto.AIResponse;
import com.huzakerna.cajero.service.AnalyticsService;
import com.huzakerna.cajero.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {

  private final AnalyticsService analyticsService;

  // Inject Groq API Key from application.yml or environment variables
  @Value("${groq.api.key}")
  private String groqApiKey;

  // RestTemplate is used to make HTTP calls to external APIs
  private final RestTemplate restTemplate = new RestTemplate();

  // Simplified Schema Context for the AI
  private static final String SCHEMA_CONTEXT = """
      You have access to a database with the following structure (schema):

      1. Table: products
         - Columns: name (String), description (String), stock (BigDecimal), buying_price (BigDecimal), selling_price (BigDecimal), category_code (String), barcode (String).
         - Relationships: Has many ProductIngredients, Has many Variants.

      2. Table: transactions
         - Columns: total_price (BigDecimal), status_code (String), transaction_type_code (String), payment_method_code (String), created_at (Timestamp).
         - Relationships: Has many TransactionProducts.

      3. Table: users
         - Columns: name (String), email (String), role_code (String), store_id (UUID).

      When answering, you can refer to these tables and columns to suggest how to find information.
      You CANNOT query the database directly yet, but you can explain how the data is structured.
      """;

  /**
   * Endpoint to handle AI chat requests.
   * Receives a prompt from the frontend, forwards it to Groq API, and returns the
   * AI's response.
   */
  @PostMapping("/chat")
  @SuppressWarnings("unchecked")
  public AIResponse chat(@RequestBody AIRequest request) {
    log.info("Received AI chat request with prompt length: {}",
        request.getPrompt() != null ? request.getPrompt().length() : 0);

    try {
      // 1. Validate API Key
      if (groqApiKey == null || groqApiKey.isEmpty()) {
        return new AIResponse("Error: Groq API Key is not configured in backend.");
      }

      // 2. Get User Context and Cached Real Data
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      String userContext = "";
      String dataContext = "";

      if (authentication != null && authentication.getPrincipal() instanceof UserDetailsImpl) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        userContext = String.format("Current User: %s (Role: %s, Store ID: %s).",
            userDetails.getUser().getName(), userDetails.getAuthorities(), userDetails.getStoreId());

        // Helper call to cached service
        dataContext = analyticsService.getAIDataContext(userDetails.getStoreId());
      }

      // 3. Prepare Groq API Request
      String url = "https://api.groq.com/openai/v1/chat/completions";

      // Set headers with API Key
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setBearerAuth(groqApiKey);

      // Construct System Prompt
      String systemPrompt = "You are a helpful assistant for a POS app. Keep responses concise.\n" +
          SCHEMA_CONTEXT + "\n" +
          userContext + "\n" +
          dataContext;

      // Construct JSON Body for Groq (OpenAI-compatible format)
      Map<String, Object> body = new HashMap<>();
      body.put("model", "llama-3.1-8b-instant"); // Using the instant model for speed
      body.put("messages", List.of(
          // System prompt defines the AI's persona
          Map.of("role", "system", "content", systemPrompt),
          // User prompt comes from the frontend request
          Map.of("role", "user", "content", request.getPrompt())));

      HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

      // 4. Call Groq API
      // We expect a Map response structure similar to OpenAI's API
      Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

      // 5. Parse Response
      if (response != null && response.containsKey("choices")) {
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (!choices.isEmpty()) {
          // Extract the actual content text from the first choice
          Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
          String content = (String) message.get("content");
          return new AIResponse(content);
        }
      }
    } catch (Exception e) {
      log.error("Error calling Groq API", e);
      // Return a user-friendly error message if something crashes
      return new AIResponse("Error: Failed to process AI request. Please try again later.");
    }

    // Default error if no response content was found
    return new AIResponse("Error: No valid response received from AI service.");
  }
}
