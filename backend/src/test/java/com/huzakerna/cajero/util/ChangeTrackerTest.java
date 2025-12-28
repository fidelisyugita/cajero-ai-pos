package com.huzakerna.cajero.util;

import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

public class ChangeTrackerTest {

  @Test
  public void testNestedChanges() {
    ChangeTracker tracker = new ChangeTracker();

    // Simulate flat fields
    tracker.compareAndTrack("tax", null, 150);

    // Simulate ingredients (nested)
    tracker.compareAndTrack("ingredient,id1", null, 1);
    tracker.compareAndTrack("ingredient,id2", null, 2);

    Map<String, Object> changes = tracker.getChanges();

    // Verify flat key
    assertTrue(changes.containsKey("tax"));

    // Verify nested grouping
    assertTrue(changes.containsKey("ingredient"));
    Object ingredientObj = changes.get("ingredient");
    assertTrue(ingredientObj instanceof Map);

    @SuppressWarnings("unchecked")
    Map<String, Object> ingredientMap = (Map<String, Object>) ingredientObj;

    assertTrue(ingredientMap.containsKey("id1"));
    assertTrue(ingredientMap.containsKey("id2"));
  }
}
