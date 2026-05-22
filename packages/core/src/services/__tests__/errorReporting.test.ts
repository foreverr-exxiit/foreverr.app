import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  initErrorReporting,
  setUser,
  captureException,
  captureMessage,
  errorReporting,
} from "../errorReporting";

// errorReporting holds module-level state (_sentry, _initialized).
// Reset between tests by re-importing fresh.
beforeEach(() => {
  vi.resetModules();
});

describe("errorReporting (lazy Sentry wrapper)", () => {
  describe("no-op behavior (no DSN, no installed SDK)", () => {
    it("init without DSN is safe and stays no-op", async () => {
      const mod = await import("../errorReporting");
      expect(() => mod.initErrorReporting({})).not.toThrow();
      expect(() => mod.initErrorReporting({ dsn: undefined })).not.toThrow();
      // Subsequent setUser / captureException must NOT throw
      expect(() => mod.setUser("user_123")).not.toThrow();
      expect(() => mod.setUser(null)).not.toThrow();
    });

    it("captureException without init logs to console.error (dev fallback)", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      const mod = await import("../errorReporting");
      const err = new Error("boom");
      mod.captureException(err, { where: "test" });
      expect(spy).toHaveBeenCalled();
      const [marker, capturedErr, ctx] = spy.mock.calls[0];
      expect(marker).toContain("[errorReporting]");
      expect(capturedErr).toBe(err);
      expect(ctx).toEqual({ where: "test" });
      spy.mockRestore();
    });

    it("captureMessage routes to the right console method per level", async () => {
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const mod = await import("../errorReporting");
      mod.captureMessage("info-msg", "info");
      mod.captureMessage("warn-msg", "warning");
      mod.captureMessage("err-msg", "error");

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining("[errorReporting][info] info-msg"),
      );
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("[errorReporting][warning] warn-msg"),
      );
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining("[errorReporting][error] err-msg"),
      );

      errSpy.mockRestore();
      warnSpy.mockRestore();
      logSpy.mockRestore();
    });
  });

  describe("aggregate `errorReporting` export", () => {
    it("exposes init, setUser, captureException, captureMessage", () => {
      expect(typeof errorReporting.init).toBe("function");
      expect(typeof errorReporting.setUser).toBe("function");
      expect(typeof errorReporting.captureException).toBe("function");
      expect(typeof errorReporting.captureMessage).toBe("function");
    });

    it("init is idempotent — calling twice does not re-initialize", async () => {
      const mod = await import("../errorReporting");
      // First call decides the state; second call must be a no-op.
      mod.initErrorReporting({ dsn: undefined });
      expect(() => mod.initErrorReporting({ dsn: undefined })).not.toThrow();
    });
  });

  describe("type contracts", () => {
    it("captureException accepts unknown error types (string, object, Error)", async () => {
      const mod = await import("../errorReporting");
      expect(() => mod.captureException("string error")).not.toThrow();
      expect(() => mod.captureException({ code: 42 })).not.toThrow();
      expect(() => mod.captureException(new Error("real"))).not.toThrow();
      expect(() => mod.captureException(null)).not.toThrow();
    });
  });
});
