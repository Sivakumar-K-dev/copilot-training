// Day 6 (QA): these tests have assertions but no descriptions. Ask Copilot for a
// Given-When-Then description above each test, then check each one against the assertions.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createRateLimiter } = require("./rateLimiter");

// Given a limiter with max 2 per window, When the same key requests 3 times in-window, Then the first 2 are allowed and the 3rd is denied.
test("test 1", () => {
  const check = createRateLimiter({ max: 2, windowMs: 1000, now: () => 0 });
  assert.equal(check("a").allowed, true);
  assert.equal(check("a").allowed, true);
  assert.equal(check("a").allowed, false);
});

// Given a limiter with max 1, When a different key ("b") requests after "a" already used its quota, Then "b" is allowed (quotas are per-key).
test("test 2", () => {
  const check = createRateLimiter({ max: 1, windowMs: 1000, now: () => 0 });
  check("a");
  assert.equal(check("b").allowed, true);
});

// Given a limiter with max 1, When the same key requests again exactly at windowMs elapsed, Then the window has reset and the request is allowed.
test("test 3", () => {
  let t = 0;
  const check = createRateLimiter({ max: 1, windowMs: 1000, now: () => t });
  check("a");
  t = 1000;
  assert.equal(check("a").allowed, true);
});

// Given no options object is passed, When createRateLimiter() is called, Then destructuring undefined throws (factory throws; check() itself never does).
test("test 4", () => {
  assert.throws(() => createRateLimiter());
});

// Given a limiter with max 3, When a key makes its first request, Then remaining is max - count = 2.
test("test 5", () => {
  const check = createRateLimiter({ max: 3, windowMs: 1000, now: () => 0 });
  assert.equal(check("a").remaining, 2);
});
