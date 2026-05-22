import { describe, it, expect } from "vitest";
import {
  POINT_VALUES,
  ACTION_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_ICONS,
  CATEGORY_COLORS,
  ACTION_LABELS,
} from "../engagement";

/**
 * Engagement service smoke tests. The awardEngagementPoints() function
 * itself does a Supabase write so it needs mocks; here we focus on the
 * pure lookup tables that drive UI labels and point math — silent
 * drift on these breaks the entire economy.
 */
describe("engagement constants — coverage and consistency", () => {
  it("every action with a point value has a category", () => {
    for (const action of Object.keys(POINT_VALUES)) {
      expect(ACTION_CATEGORIES[action]).toBeDefined();
    }
  });

  it("every action with a point value has a human-readable label", () => {
    for (const action of Object.keys(POINT_VALUES)) {
      expect(ACTION_LABELS[action]).toBeDefined();
      expect(ACTION_LABELS[action]).not.toBe("");
    }
  });

  it("every category referenced by ACTION_CATEGORIES is defined in CATEGORY_LABELS / ICONS / COLORS", () => {
    const referenced = new Set(Object.values(ACTION_CATEGORIES));
    for (const cat of referenced) {
      expect(CATEGORY_LABELS[cat]).toBeDefined();
      expect(CATEGORY_ICONS[cat]).toBeDefined();
      expect(CATEGORY_COLORS[cat]).toBeDefined();
    }
  });

  it("no point value is negative — economy is additive only", () => {
    for (const [action, points] of Object.entries(POINT_VALUES)) {
      expect(points, `Action ${action} has negative points`).toBeGreaterThanOrEqual(0);
    }
  });

  it("category colors are valid hex codes (#RRGGBB or #RGB)", () => {
    const hex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    for (const [cat, color] of Object.entries(CATEGORY_COLORS)) {
      expect(color, `${cat} color "${color}" is not hex`).toMatch(hex);
    }
  });

  it("high-value actions cost more than low-value ones", () => {
    // Anchors: creating a memorial > sending a gift > reacting to content
    expect(POINT_VALUES.create_memorial).toBeGreaterThan(POINT_VALUES.create_tribute);
    expect(POINT_VALUES.create_tribute).toBeGreaterThan(POINT_VALUES.add_milestone ?? 0);
  });
});
