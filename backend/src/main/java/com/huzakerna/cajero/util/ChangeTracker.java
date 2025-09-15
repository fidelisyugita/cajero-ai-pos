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
