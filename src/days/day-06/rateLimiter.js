// Day 6 (Dev): ask Copilot to document this module, then CHECK the docstring against the real behavior.

/**
 * Creates a fixed-window rate limiter (window resets on first request after expiry, not a true sliding window).
 * @param {{max: number, windowMs: number, now?: () => number}} options - request cap, window size in ms, optional clock override.
 * @returns {(key: string) => {allowed: boolean, remaining: number}} check(key) - never throws; always returns whether the request is allowed and requests remaining in the current window.
 * @throws {TypeError} If called with no `options` argument, e.g. `createRateLimiter()`.
 */
function createRateLimiter(options) {
  const { max, windowMs, now = Date.now } = options;
  const windows = new Map();

  return function check(key) {
    const t = now();
    let w = windows.get(key);
    if (!w || t - w.start >= windowMs) {
      w = { start: t, count: 0 };
      windows.set(key, w);
    }
    w.count += 1;
    return { allowed: w.count <= max, remaining: Math.max(0, max - w.count) };
  };
}

module.exports = { createRateLimiter };
