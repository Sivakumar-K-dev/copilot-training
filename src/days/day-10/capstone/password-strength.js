// Capstone option B (starter): password strength checker (no UI).
// Requirements (build them with Copilot, then test them):
//  - checkPassword(password) returns { score: 0-4, label, problems: [] }
//  - problems lists every failed rule: shorter than 12 chars, no uppercase, no lowercase, no digit, no symbol, common password
//  - label is one of: "weak", "fair", "good", "strong"
//  - never logs or stores the password
//  - no external dependencies
//
// Dev builds this. QA writes the tests in parallel FROM THE REQUIREMENTS, not from this code.

const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "123456",
  "12345678",
  "qwerty",
  "letmein",
  "admin",
  "welcome",
]);

function checkPassword(password) {
  if (typeof password !== "string") {
    return { score: 0, label: "weak", problems: [] };
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return { score: 0, label: "weak", problems: ["common password"] };
  }

  const problems = [];
  let score = 4;

  if (password.length < 12) {
    problems.push("shorter than 12 chars");
    score--;
  }

  if (!/[A-Z]/.test(password)) {
    problems.push("no uppercase");
    score--;
  }

  if (!/[a-z]/.test(password)) {
    problems.push("no lowercase");
    score--;
  }

  if (!/[0-9]/.test(password)) {
    problems.push("no digit");
    score--;
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    problems.push("no symbol");
    score--;
  }

  score = Math.max(0, Math.min(4, score));

  let label;
  if (score <= 1) {
    label = "weak";
  } else if (score === 2) {
    label = "fair";
  } else if (score === 3) {
    label = "good";
  } else {
    label = "strong";
  }

  return { score, label, problems };
}

module.exports = { checkPassword };
