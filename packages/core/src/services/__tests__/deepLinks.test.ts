import { describe, it, expect } from "vitest";
import { handleDeepLink, generateDeepLink } from "../deepLinks";

/**
 * Deep-link parsing is a security-adjacent surface: malformed input
 * shouldn't route the user to unexpected screens, and the legacy-username
 * fallback shouldn't swallow other patterns. These tests pin the routing
 * contract so future changes that shadow earlier patterns get caught.
 */
describe("handleDeepLink — URL parsing", () => {
  describe("custom scheme (eterrn://)", () => {
    it("routes a memorial deep link to /lifecycle/:id", () => {
      const uuid = "0fdb7a4f-8a44-4cf4-a6db-2bcc6a2a1b9b";
      expect(handleDeepLink(`eterrn://memorial/${uuid}`)).toBe(`/lifecycle/${uuid}`);
    });

    it("routes memorial sub-pages before the generic pattern", () => {
      const uuid = "0fdb7a4f-8a44-4cf4-a6db-2bcc6a2a1b9b";
      expect(handleDeepLink(`eterrn://memorial/${uuid}/wall`)).toBe(
        `/lifecycle/${uuid}/wall`,
      );
    });

    it("routes timeline sub-page with memorialId param", () => {
      const uuid = "0fdb7a4f-8a44-4cf4-a6db-2bcc6a2a1b9b";
      expect(handleDeepLink(`eterrn://memorial/${uuid}/timeline`)).toBe(
        `/timeline?memorialId=${uuid}`,
      );
    });
  });

  describe("universal links (https://eterrn.app/...)", () => {
    it("routes invite codes", () => {
      expect(handleDeepLink("https://eterrn.app/invite/ABC123")).toBe(
        "/invite?code=ABC123",
      );
    });

    it("routes /billing without params", () => {
      expect(handleDeepLink("https://eterrn.app/billing")).toBe("/billing");
    });

    it("routes user profiles", () => {
      const uuid = "0fdb7a4f-8a44-4cf4-a6db-2bcc6a2a1b9b";
      expect(handleDeepLink(`https://eterrn.app/user/${uuid}`)).toBe(
        `/user/${uuid}`,
      );
    });

    it("falls back to legacy-link for plain usernames", () => {
      expect(handleDeepLink("https://eterrn.app/johnsmith")).toBe(
        "/legacy-link?slug=johnsmith",
      );
    });
  });

  describe("defensive parsing", () => {
    it("returns null for empty/null input", () => {
      expect(handleDeepLink("")).toBeNull();
      expect(handleDeepLink(undefined as unknown as string)).toBeNull();
    });

    it("legacy-username fallback catches paths whose last segment is a valid username", () => {
      // Documents real behavior: the legacy `/\/([a-zA-Z0-9_-]+)$/`
      // pattern matches the LAST segment, so multi-segment URLs whose
      // tail looks like a username will route to legacy-link.
      expect(handleDeepLink("https://eterrn.app/foo/bar/baz")).toBe(
        "/legacy-link?slug=baz",
      );
    });

    it("returns null when the last segment contains URL-illegal chars", () => {
      // Path segments with periods/spaces don't match the username regex.
      expect(handleDeepLink("https://eterrn.app/foo/bar.tar.gz")).toBeNull();
    });

    it("does not throw on malformed URLs", () => {
      expect(() => handleDeepLink("not a url at all")).not.toThrow();
      expect(() => handleDeepLink("eterrn://")).not.toThrow();
      expect(() => handleDeepLink("https://")).not.toThrow();
    });
  });
});

describe("generateDeepLink — share URL construction", () => {
  it("constructs memorial URLs against the lifecycle route", () => {
    expect(generateDeepLink("memorial", "abc-123")).toBe(
      "https://eterrn.app/lifecycle/abc-123",
    );
  });

  it("constructs user profile URLs", () => {
    expect(generateDeepLink("user", "u-1")).toBe(
      "https://eterrn.app/user/u-1",
    );
  });

  it("constructs invite URLs", () => {
    expect(generateDeepLink("invite", "INV-99")).toBe(
      "https://eterrn.app/invite/INV-99",
    );
  });
});
