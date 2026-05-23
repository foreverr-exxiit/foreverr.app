/**
 * Error Reporting — Sentry wrapper (lazy, no-op by default)
 *
 * Designed so the rest of the codebase can call captureException /
 * setUser / captureMessage without worrying about whether Sentry is
 * actually installed and configured.
 *
 * Activation:
 *   1. Add the dependency:
 *        cd apps/mobile && pnpm add @sentry/react-native
 *   2. Set EXPO_PUBLIC_SENTRY_DSN in your env (.env + all 3 eas.json
 *      env blocks for development/preview/production).
 *   3. The root layout calls initErrorReporting() once at startup;
 *      if the DSN is present and the package resolves, Sentry takes
 *      over. Otherwise this stays a no-op (dev logs to console).
 *
 * Why a wrapper:
 *   - useAuth, deletion flow, and analytics flush can call setUser /
 *     captureException right now without crashing if Sentry isn't
 *     installed yet.
 *   - Flipping the switch later is one install + one env var, with no
 *     code edits across the app.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sentry: any = null;
let _initialized = false;

declare const __DEV__: boolean;

export interface InitOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  /** 0.0–1.0 sample rate for performance traces (default 0.1) */
  tracesSampleRate?: number;
}

/**
 * Call once at app startup (root layout). Safe to call without a DSN —
 * it just no-ops. Safe to call when @sentry/react-native isn't
 * installed — it just no-ops.
 */
export function initErrorReporting(opts: InitOptions = {}): void {
  if (_initialized) return;
  _initialized = true;

  if (!opts.dsn) {
    if (__DEV__) {
      console.log("[errorReporting] no DSN provided — running as no-op");
    }
    return;
  }

  try {
    // Dynamic require so TypeScript / bundler doesn't choke when the
    // package isn't installed yet. The wrapper degrades gracefully.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _sentry = require("@sentry/react-native");
    const environment =
      opts.environment ?? (__DEV__ ? "development" : "production");
    _sentry.init({
      dsn: opts.dsn,
      environment,
      release: opts.release,
      tracesSampleRate: opts.tracesSampleRate ?? 0.1,
      attachStacktrace: true,
      // Sensible defaults for a memorial app — don't send PII automatically.
      sendDefaultPii: false,
    });
    if (__DEV__) {
      // Mask all but the project ID so the DSN isn't echoed in logs.
      // Format: https://<key>@<org>.ingest.sentry.io/<project-id>
      const projectId = opts.dsn.split("/").pop() ?? "?";
      console.log(
        `[errorReporting] Sentry active — environment=${environment} project=${projectId}`,
      );
    }
  } catch (err) {
    _sentry = null;
    if (__DEV__) {
      console.warn(
        "[errorReporting] @sentry/react-native not installed — `pnpm add @sentry/react-native` to enable.",
      );
    }
  }
}

/**
 * Diagnostic helper — true if Sentry is initialized and accepting events.
 * Useful in startup logs or settings screens to verify configuration.
 */
export function isErrorReportingActive(): boolean {
  return !!_sentry;
}

/**
 * Tag the active user. Pass null on sign-out to clear.
 * Mirror this call wherever you call analytics.identify / analytics.reset.
 */
export function setUser(userId: string | null): void {
  if (!_sentry) return;
  _sentry.setUser(userId ? { id: userId } : null);
}

/**
 * Capture a caught exception with optional structured context.
 * In dev with no Sentry, logs to console.error.
 */
export function captureException(
  err: unknown,
  context?: Record<string, unknown>,
): void {
  if (_sentry) {
    _sentry.captureException(err, context ? { extra: context } : undefined);
    return;
  }
  if (__DEV__) {
    console.error("[errorReporting]", err, context ?? "");
  }
}

/**
 * Send a freeform message (e.g. unusual but non-throwing conditions).
 */
export function captureMessage(
  msg: string,
  level: "info" | "warning" | "error" = "info",
): void {
  if (_sentry) {
    _sentry.captureMessage(msg, level);
    return;
  }
  if (__DEV__) {
    const fn =
      level === "error"
        ? console.error
        : level === "warning"
          ? console.warn
          : console.log;
    fn(`[errorReporting][${level}] ${msg}`);
  }
}

/** Aggregate export for ergonomic call sites. */
export const errorReporting = {
  init: initErrorReporting,
  setUser,
  captureException,
  captureMessage,
  isActive: isErrorReportingActive,
};
