const { test } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const VALIDATOR = path.join(__dirname, "validate-csv.js");
const TEMP_DIR = os.tmpdir();

function createTempCSV(filename, content) {
  const filepath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filepath, content, "utf8");
  return filepath;
}

function runValidator(filepath) {
  try {
    const stdout = execFileSync("node", [VALIDATOR, filepath], {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout, stderr: "", exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || "",
      stderr: error.stderr || "",
      exitCode: error.status || 1,
    };
  }
}

test("1. All valid email rows return exit code 0", async () => {
  const csv = createTempCSV("valid-emails.csv", "name,email\nAlice,alice@example.com\nBob,bob@test.co.uk\n");
  try {
    const result = runValidator(csv);
    assert.equal(result.exitCode, 0, "Expected exit code 0 for valid emails");
    assert.match(result.stdout, /0 invalid/, "Expected 0 invalid in summary");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("2. One or more invalid rows return exit code 1", async () => {
  const csv = createTempCSV("invalid-emails.csv", "name,email\nAlice,alice@example.com\nBob,invalid-email\n");
  try {
    const result = runValidator(csv);
    assert.equal(result.exitCode, 1, "Expected exit code 1 when invalid rows exist");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("3. Every invalid row is printed", async () => {
  const csv = createTempCSV("multiple-invalid.csv", "name,email\nA,good@example.com\nB,bad1\nC,bad2@\nD,bad3 @example.com\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 3/, "Expected Line 3 in output");
    assert.match(result.stdout, /Line 4/, "Expected Line 4 in output");
    assert.match(result.stdout, /Line 5/, "Expected Line 5 in output");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("4. Empty email is reported as invalid", async () => {
  const csv = createTempCSV("empty-email.csv", "name,email\nAlice,\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 2/, "Expected Line 2 in output");
    assert.match(result.stdout, /empty email/, "Expected 'empty email' reason");
    assert.equal(result.exitCode, 1, "Expected exit code 1");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("5. Email without a valid domain dot is reported", async () => {
  const csv = createTempCSV("no-dot-domain.csv", "name,email\nAlice,alice@localhost\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 2/, "Expected Line 2 in output");
    assert.match(result.stdout, /domain without a dot/, "Expected domain dot error");
    assert.equal(result.exitCode, 1, "Expected exit code 1");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("6. Email missing text before @ is reported", async () => {
  const csv = createTempCSV("missing-before-at.csv", "name,email\nAlice,@example.com\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 2/, "Expected Line 2 in output");
    assert.match(result.stdout, /missing text before @/, "Expected 'missing text before @' reason");
    assert.equal(result.exitCode, 1, "Expected exit code 1");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("7. Email containing whitespace is reported", async () => {
  const csv = createTempCSV("whitespace-email.csv", "name,email\nAlice,alice example@example.com\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 2/, "Expected Line 2 in output");
    assert.match(result.stdout, /whitespace/, "Expected whitespace error");
    assert.equal(result.exitCode, 1, "Expected exit code 1");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("8. Physical CSV line numbers are correct", async () => {
  const csv = createTempCSV("line-numbers.csv", "name,email\nA,valid@example.com\nB,invalid-email\nC,good@test.org\nD,@example.com\n");
  try {
    const result = runValidator(csv);
    const lines = result.stdout.split("\n");
    const invalidLines = lines.filter(l => l.startsWith("Line"));
    assert.equal(invalidLines.length, 2, "Expected 2 invalid lines reported");
    assert.match(invalidLines[0], /Line 3/, "Expected first invalid at Line 3");
    assert.match(invalidLines[1], /Line 5/, "Expected second invalid at Line 5");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("9. Total, valid, and invalid summary counts are correct", async () => {
  const csv = createTempCSV("summary-counts.csv", "name,email\nA,a@x.co\nB,invalid\nC,c@y.org\nD,bad@\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Summary: 4 rows/, "Expected 4 total rows");
    assert.match(result.stdout, /2 valid/, "Expected 2 valid rows");
    assert.match(result.stdout, /2 invalid/, "Expected 2 invalid rows");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("10. Missing filename returns exit code 1 with a clear error", async () => {
  try {
    execFileSync("node", [VALIDATOR], { encoding: "utf8" });
    assert.fail("Should have thrown");
  } catch (error) {
    assert.equal(error.status, 1, "Expected exit code 1");
    assert.match(error.stderr, /filename required|Usage/, "Expected clear error message");
  }
});

test("11. Nonexistent file returns exit code 1 with a clear error", async () => {
  try {
    execFileSync("node", [VALIDATOR, "/nonexistent/path/file.csv"], { encoding: "utf8" });
    assert.fail("Should have thrown");
  } catch (error) {
    assert.equal(error.status, 1, "Expected exit code 1");
    assert.match(error.stderr, /not found|Error/, "Expected clear error message");
  }
});

test("12. Missing email column returns exit code 1 with a clear error", async () => {
  const csv = createTempCSV("no-email-col.csv", "name,address\nAlice,123 Main St\n");
  try {
    execFileSync("node", [VALIDATOR, csv], { encoding: "utf8" });
    assert.fail("Should have thrown");
  } catch (error) {
    assert.equal(error.status, 1, "Expected exit code 1");
    assert.match(error.stderr, /email.*column|Error/, "Expected 'email column' error");
  } finally {
    fs.unlinkSync(csv);
  }
});

test("13. Header-only CSV returns zero total rows", async () => {
  const csv = createTempCSV("header-only.csv", "name,email\n");
  try {
    try {
      execFileSync("node", [VALIDATOR, csv], { encoding: "utf8" });
      assert.fail("Should have thrown");
    } catch (error) {
      assert.equal(error.status, 1, "Expected exit code 1 for empty CSV");
      assert.match(error.stderr, /no data rows|Error/, "Expected 'no data rows' error");
    }
  } finally {
    fs.unlinkSync(csv);
  }
});

test("14. The email column works when it is not the first column", async () => {
  const csv = createTempCSV("email-not-first.csv", "age,name,email,phone\n25,Alice,alice@example.com,555-1234\n30,Bob,invalid-email,555-5678\n");
  try {
    const result = runValidator(csv);
    assert.match(result.stdout, /Line 3/, "Expected Line 3 (Bob with invalid email)");
    assert.match(result.stdout, /invalid-email/, "Expected invalid email shown");
    assert.equal(result.exitCode, 1, "Expected exit code 1");
  } finally {
    fs.unlinkSync(csv);
  }
});
