package com.huzakerna.cajero.service;

import com.huzakerna.cajero.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    /**
     * Fetches aggregated analytics data for the given store.
     * Caches the result for 15 minutes (configured in application.yml).
     */
    @Cacheable(value = "ai-analytics", key = "#storeId")
    public String getAIDataContext(UUID storeId) {
        log.info("Fetching fresh analytics data from database for store: {}", storeId);

        Instant now = Instant.now();
        Instant startOfDay = now.atZone(ZoneId.systemDefault()).toLocalDate().atStartOfDay(ZoneId.systemDefault())
                .toInstant();
        Instant endOfDay = now.atZone(ZoneId.systemDefault()).toLocalDate().atTime(LocalTime.MAX)
                .atZone(ZoneId.systemDefault()).toInstant();

        try {
            // 1. Sales Today
            Object salesSummary = transactionRepository.findSalesSummary(storeId, startOfDay, endOfDay);

            // 2. Top Products (Last 30 Days)
            List<Object> topProducts = transactionRepository.findTopSellingProducts(storeId,
                    startOfDay.minus(30, ChronoUnit.DAYS), endOfDay, PageRequest.of(0, 5));

            // 3. Frequent Customers (Last 30 Days)
            List<Object> frequentDescriptions = transactionRepository.findFrequentDescriptions(storeId,
                    startOfDay.minus(30, ChronoUnit.DAYS), endOfDay, PageRequest.of(0, 5));

            // 4. Peak Hours (Last 30 Days)
            // Native Queries return List<Object[]>
            List<Object[]> peakHoursList = transactionRepository.findPeakHours(storeId,
                    startOfDay.minus(30, ChronoUnit.DAYS), endOfDay);
            String peakHours = peakHoursList.stream()
                    .map(row -> String.format("{hour=%s, count=%s}", row[0], row[1]))
                    .toList().toString();

            // 5. Busiest Days (Last 30 Days)
            List<Object[]> busyDaysList = transactionRepository.findBusyDays(storeId,
                    startOfDay.minus(30, ChronoUnit.DAYS), endOfDay);
            String busyDays = busyDaysList.stream()
                    .map(row -> String.format("{dayOfWeek=%s, count=%s}", row[0], row[1]))
                    .toList().toString();

            return String.format(
                    """

                            REAL-TIME DATA CONTEXT (Cached ~15m):
                            - Sales Today: %s
                            - Top Selling Products (Last 30 Days): %s
                            - Make sure to prioritize products that are available in stock.
                            - Frequent Customer Descriptions (Last 30 Days): %s
                            - Peak Hours (Last 30 Days): %s (Format: hour=0-23, count=transactions)
                            - Busiest Days (Last 30 Days): %s (Format: dayOfWeek=1(Mon)-7(Sun), count=transactions)

                            Use this data to answer user questions about sales, revenue, popular items, frequent customers, or busy times directly.
                            For "Peak Hours", convert 24h format to AM/PM (e.g. 13 -> 1 PM).
                            For "Busiest Days", convert numbers to Day Names (1=Monday, 7=Sunday).
                            If the user asks about "customers", refer to the "Frequent Customer Descriptions" data as likely customer names or notes.
                            """,
                    salesSummary, topProducts, frequentDescriptions, peakHours, busyDays);

        } catch (Exception e) {
            log.error("Error fetching analytics data for AI", e);
            return "\n\nREAL-TIME DATA CONTEXT: [Data Currently Unavailable]";
        }
    }
}
