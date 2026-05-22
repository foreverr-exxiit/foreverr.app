// Stub used by vitest config alias — react-native's real entry can't be
// parsed in node (Flow syntax, native modules). Tests that need richer
// behavior should add their own per-test vi.mock("react-native", ...).
export const Platform = { OS: "ios" as const, select: <T>(opts: { ios?: T; android?: T; default?: T }) => opts.ios ?? opts.default };
export default { Platform };
