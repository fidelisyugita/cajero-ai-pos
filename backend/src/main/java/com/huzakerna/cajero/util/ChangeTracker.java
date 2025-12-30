package com.huzakerna.cajero.util;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class ChangeTracker {
  private final Map<String, Object> oldValues = new HashMap<>();
  private final Map<String, Object> newValues = new HashMap<>();

  /**
   * Compare two values and track if they are different
   * 
   * @param fieldName The name of the field being compared
   * @param oldValue  The old value
   * @param newValue  The new value
   * @return true if values are different, false if they are the same
   */
  public boolean compareAndTrack(String fieldName, Object oldValue, Object newValue) {
    // Handle null cases
    if (oldValue == null && newValue == null) {
      return false;
    }
    if (oldValue == null || newValue == null) {
      oldValues.put(fieldName, oldValue);
      newValues.put(fieldName, newValue);
      return true;
    }

    // Compare non-null values
    if (oldValue instanceof java.math.BigDecimal && newValue instanceof java.math.BigDecimal) {
      if (((java.math.BigDecimal) oldValue).compareTo((java.math.BigDecimal) newValue) != 0) {
        oldValues.put(fieldName, oldValue);
        newValues.put(fieldName, newValue);
        return true;
      }
      return false;
    }

    if (!Objects.equals(oldValue, newValue)) {
      oldValues.put(fieldName, oldValue);
      newValues.put(fieldName, newValue);
      return true;
    }

    return false;
  }

  /**
   * Get the map of old values that were different
   */
  public Map<String, Object> getOldValues() {
    return oldValues;
  }

  /**
   * Get the map of new values that were different
   */
  public Map<String, Object> getNewValues() {
    return newValues;
  }

  /**
   * Get the consolidated changes map
   * Format: fieldName -> { "old": oldValue, "new": newValue }
   * Supports nested keys via "k1,k2" -> "k1": { "k2": ... }
   */
  public Map<String, Object> getChanges() {
    Map<String, Object> changes = new HashMap<>();

    for (String field : oldValues.keySet()) {
      Map<String, Object> diff = new HashMap<>();
      diff.put("old", oldValues.get(field));
      diff.put("new", newValues.get(field));

      if (field.contains(",")) {
        // Handle nested key: "group,id" -> "group": { "id": diff }
        String[] parts = field.split(",", 2);
        String group = parts[0];
        String id = parts[1];

        @SuppressWarnings("unchecked")
        Map<String, Object> groupMap = (Map<String, Object>) changes.computeIfAbsent(group,
            k -> new HashMap<String, Object>());
        groupMap.put(id, diff);
      } else {
        // Flat key
        changes.put(field, diff);
      }
    }

    return changes;
  }

  /**
   * Check if any changes were tracked
   */
  public boolean hasChanges() {
    return !oldValues.isEmpty();
  }

  /**
   * Clear all tracked changes
   */
  public void clear() {
    oldValues.clear();
    newValues.clear();
  }
}
