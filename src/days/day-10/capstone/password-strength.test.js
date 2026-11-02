const { test } = require("node:test");
const assert = require("node:assert/strict");
const { checkPassword } = require("./password-strength.js");

test("1. A valid strong password returns score 4, label strong, and no problems", () => {
  const result = checkPassword("MyP@ssw0rd!Secure");
  assert.equal(result.score, 4, "Expected score 4");
  assert.equal(result.label, "strong", "Expected label 'strong'");
  assert.deepEqual(result.problems, [], "Expected no problems");
});

test("2. A password shorter than 12 characters reports shorter than 12 chars", () => {
  const result = checkPassword("Aa1!b2c3d4e");
  assert(
    result.problems.includes("shorter than 12 chars"),
    "Expected 'shorter than 12 chars' in problems"
  );
});

test("3. A valid password with exactly 12 characters passes the length rule", () => {
  const result = checkPassword("Aa1!b2c3d4e5f");
  assert(
    !result.problems.includes("shorter than 12 chars"),
    "Expected no length problem for 12-char password"
  );
});

test("4. A password without uppercase reports no uppercase", () => {
  const result = checkPassword("abc123!@#xyz");
  assert(
    result.problems.includes("no uppercase"),
    "Expected 'no uppercase' in problems"
  );
});

test("5. A password without lowercase reports no lowercase", () => {
  const result = checkPassword("ABC123!@#XYZ");
  assert(
    result.problems.includes("no lowercase"),
    "Expected 'no lowercase' in problems"
  );
});

test("6. A password without a digit reports no digit", () => {
  const result = checkPassword("AaBbCcDdEeFf!");
  assert(
    result.problems.includes("no digit"),
    "Expected 'no digit' in problems"
  );
});

test("7. A password without a symbol reports no symbol", () => {
  const result = checkPassword("AaBbCcDdEeFf123");
  assert(
    result.problems.includes("no symbol"),
    "Expected 'no symbol' in problems"
  );
});

test("8. A common password reports common password", () => {
  const result = checkPassword("password");
  assert(
    result.problems.includes("common password"),
    "Expected 'common password' in problems"
  );
});

test("9. A common password receives score 0 and label weak", () => {
  const result = checkPassword("password123");
  assert.equal(result.score, 0, "Expected score 0 for common password");
  assert.equal(result.label, "weak", "Expected label 'weak' for common password");
});

test("10. Common-password matching is case-insensitive", () => {
  const variations = ["password", "PASSWORD", "Password", "PaSSWoRd"];
  variations.forEach((pwd) => {
    const result = checkPassword(pwd);
    assert.equal(
      result.score,
      0,
      `Expected score 0 for '${pwd}' (common password)`
    );
    assert(
      result.problems.includes("common password"),
      `Expected 'common password' for '${pwd}'`
    );
  });
});

test("11. A password failing multiple rules reports every applicable problem", () => {
  const result = checkPassword("abc");
  assert(
    result.problems.includes("shorter than 12 chars"),
    "Expected 'shorter than 12 chars'"
  );
  assert(
    result.problems.includes("no uppercase"),
    "Expected 'no uppercase'"
  );
  assert(
    result.problems.includes("no digit"),
    "Expected 'no digit'"
  );
  assert(
    result.problems.includes("no symbol"),
    "Expected 'no symbol'"
  );
  assert.equal(result.problems.length, 4, "Expected exactly 4 problems");
});

test("12. Empty string input is handled without crashing", () => {
  assert.doesNotThrow(() => {
    const result = checkPassword("");
    assert.equal(typeof result.score, "number");
    assert.equal(typeof result.label, "string");
    assert(Array.isArray(result.problems));
  });
});

test("13. Null, undefined, and numeric inputs are handled without crashing", () => {
  const inputs = [null, undefined, 12345, 0, true, false, {}, []];
  inputs.forEach((input) => {
    assert.doesNotThrow(() => {
      const result = checkPassword(input);
      assert.equal(typeof result.score, "number");
      assert.equal(typeof result.label, "string");
      assert(Array.isArray(result.problems));
    }, `Should handle ${typeof input} input without crashing`);
  });
});

test("14. Score always remains between 0 and 4", () => {
  const testPasswords = [
    "a",
    "ab",
    "abc",
    "abcd",
    "Aa",
    "Aa1",
    "Aa1!",
    "Aa1!b2c3d4e5",
    "Aa1!b2c3d4e5f",
    "Aa1!b2c3d4e5fAa1!b2c3d4e5f",
    "",
    "password",
  ];
  testPasswords.forEach((pwd) => {
    const result = checkPassword(pwd);
    assert(
      result.score >= 0 && result.score <= 4,
      `Expected score between 0-4, got ${result.score} for '${pwd}'`
    );
  });
});

test("15. Label is always one of weak, fair, good, or strong", () => {
  const validLabels = ["weak", "fair", "good", "strong"];
  const testPasswords = [
    "a",
    "ab",
    "Aa",
    "Aa1",
    "Aa1!",
    "Aa1!b2c3d4e5",
    "Aa1!b2c3d4e5f",
    "password",
    "",
    null,
    undefined,
    12345,
  ];
  testPasswords.forEach((pwd) => {
    const result = checkPassword(pwd);
    assert(
      validLabels.includes(result.label),
      `Expected label to be one of [${validLabels.join(", ")}], got '${result.label}'`
    );
  });
});

test("16. The returned object never contains the supplied password", () => {
  const passwords = [
    "MyP@ssw0rd!Secure",
    "password123",
    "abc123!@#XYZ",
    "MySecretP@ss123",
  ];
  passwords.forEach((pwd) => {
    const result = checkPassword(pwd);
    const resultStr = JSON.stringify(result);
    assert(
      !resultStr.includes(pwd),
      `Password '${pwd}' should not appear in result: ${resultStr}`
    );
  });
});

test("17. The function never calls console.log", () => {
  const originalLog = console.log;
  let logCalled = false;

  console.log = () => {
    logCalled = true;
  };

  try {
    const testPasswords = [
      "password",
      "Aa1!b2c3d4e5f",
      "abc",
      null,
      undefined,
      "",
    ];
    testPasswords.forEach((pwd) => {
      checkPassword(pwd);
    });
    assert.equal(
      logCalled,
      false,
      "Expected checkPassword to never call console.log"
    );
  } finally {
    console.log = originalLog;
  }
});
