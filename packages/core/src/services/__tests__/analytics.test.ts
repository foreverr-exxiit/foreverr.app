import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Track every insert payload the analytics service tries to send.
// Wired up before importing analytics so the supabase mock is in place
// when the module reads its imports.
const insertSpy = vi.fn(async () => ({ error: null }));
vi.mock("../../supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: insertSpy,
    }),
  },
}));

// captureException must not throw during tests; route to a stub.
vi.mock("../errorReporting", () => ({
  captureException: vi.fn(),
}));

// expo-constants uses a native module under the hood; stub the module
// shape that analytics.ts reads (`Constants.expoConfig?.version`).
vi.mock("expo-constants", () => ({
  default: { expoConfig: { version: "1.0.0-test" } },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  insertSpy.mockClear();
  insertSpy.mockImplementation(async () => ({ error: null }));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("analytics service", () => {
  describe("identify / reset", () => {
    it("identify attaches user_id to subsequent track calls", async () => {
      const { analytics } = await import("../analytics");

      analytics.identify("user_abc");
      analytics.track("memorial_created", { memorial_id: "mem_1" });

      // Force the debounced batch out via the 5s timer
      await vi.advanceTimersByTimeAsync(5_100);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      const rows = insertSpy.mock.calls[0][0];
      // identify itself enqueues a row + the explicit track call below it
      const tracked = rows.find((r: any) => r.event_name === "memorial_created");
      expect(tracked).toBeTruthy();
      expect(tracked.user_id).toBe("user_abc");
      expect(tracked.properties.user_id).toBe("user_abc");
    });

    it("reset clears user_id so subsequent track has null user", async () => {
      const { analytics } = await import("../analytics");

      analytics.identify("user_x");
      analytics.reset();
      analytics.track("sign_out");

      await vi.advanceTimersByTimeAsync(5_100);

      const rows = insertSpy.mock.calls[0][0];
      const signOut = rows.find((r: any) => r.event_name === "sign_out");
      expect(signOut.user_id).toBeNull();
      expect(signOut.properties.user_id).toBeNull();
    });
  });

  describe("track enrichment", () => {
    it("each event is tagged with platform + app_version", async () => {
      const { analytics } = await import("../analytics");

      analytics.track("paywall_shown", { feature_label: "ai_obituary" });
      await vi.advanceTimersByTimeAsync(5_100);

      const row = insertSpy.mock.calls[0][0][0];
      // Mock react-native shim returns Platform.OS = "ios" — see
      // src/services/__tests__/__mocks__/react-native.ts
      expect(row.properties.platform).toBeDefined();
      expect(row.properties.app_version).toBeDefined();
      // Original property pass-through
      expect(row.properties.feature_label).toBe("ai_obituary");
    });
  });

  describe("screen() convenience wrapper", () => {
    it("screen produces a screen_view event with screen_name", async () => {
      const { analytics } = await import("../analytics");

      analytics.screen("Lifecycle Detail", { memorial_id: "mem_42" });
      await vi.advanceTimersByTimeAsync(5_100);

      const row = insertSpy.mock.calls[0][0][0];
      expect(row.event_name).toBe("screen_view");
      expect(row.properties.screen_name).toBe("Lifecycle Detail");
      expect(row.properties.memorial_id).toBe("mem_42");
    });
  });

  describe("batching behavior", () => {
    it("debounces flush by 5s so rapid calls coalesce", async () => {
      const { analytics } = await import("../analytics");

      analytics.track("gift_sent", { gift_id: "g1" });
      // 1s in — should NOT flush yet
      await vi.advanceTimersByTimeAsync(1_000);
      expect(insertSpy).not.toHaveBeenCalled();

      analytics.track("gift_sent", { gift_id: "g2" });
      // Another 3s — total elapsed 4s. The second track reset the
      // timer to 0, so still not flushed.
      await vi.advanceTimersByTimeAsync(3_000);
      expect(insertSpy).not.toHaveBeenCalled();

      // Cross the 5s mark from the second track
      await vi.advanceTimersByTimeAsync(2_500);
      expect(insertSpy).toHaveBeenCalledTimes(1);
      const rows = insertSpy.mock.calls[0][0];
      expect(rows).toHaveLength(2);
    });

    it("flushes immediately when batch hits 20 events", async () => {
      const { analytics } = await import("../analytics");

      for (let i = 0; i < 20; i++) {
        analytics.track("user_followed", { target_user_id: `u${i}` });
      }

      // No timer advance — the 20th event should have triggered flush
      // synchronously (or near-synchronously).
      await vi.advanceTimersByTimeAsync(0);
      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy.mock.calls[0][0]).toHaveLength(20);
    });
  });

  describe("explicit flush()", () => {
    it("flush() drains pending events without waiting for debounce", async () => {
      const { analytics } = await import("../analytics");

      analytics.track("sign_in", { method: "apple" });
      expect(insertSpy).not.toHaveBeenCalled();

      analytics.flush();
      // flush() is sync-fire-and-forget; let the awaited insert resolve
      await vi.advanceTimersByTimeAsync(0);
      expect(insertSpy).toHaveBeenCalledTimes(1);
    });
  });
});
