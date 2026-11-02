#!/usr/bin/env node
// Capstone option A (starter): CSV email validator CLI.
// Usage: node validate-csv.js sample.csv
// Requirements (build them with Copilot, then test them):
//  - read a CSV with a header row containing an "email" column
//  - print every invalid row as: line number, the email, the reason
//  - print a summary: total rows, valid, invalid
//  - exit code 1 when any row is invalid, 0 otherwise
//  - no external dependencies
//
// Dev builds this. QA writes the tests in parallel FROM THE REQUIREMENTS, not from this code.

const fs = require("node:fs");
const readline = require("node:readline");

function validateEmail(email) {
  if (!email || email.trim() === "") {
    return { valid: false, reason: "empty email" };
  }
  if (email !== email.trim() || /\s/.test(email)) {
    return { valid: false, reason: "email contains whitespace" };
  }
  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return { valid: false, reason: "missing @ symbol" };
  }
  if (atIndex === 0) {
    return { valid: false, reason: "missing text before @" };
  }
  const afterAt = email.slice(atIndex + 1);
  if (!afterAt) {
    return { valid: false, reason: "missing domain after @" };
  }
  if (!afterAt.includes(".")) {
    return { valid: false, reason: "domain without a dot" };
  }
  return { valid: true };
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function main() {
  const filename = process.argv[2];

  if (!filename) {
    console.error("Error: CSV filename required");
    console.error("Usage: node validate-csv.js <filename>");
    process.exit(1);
  }

  if (!fs.existsSync(filename)) {
    console.error(`Error: File not found: ${filename}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(filename);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let emailColumnIndex = -1;
  let lineNumber = 0;
  let rowsProcessed = 0;
  let validCount = 0;
  let invalidCount = 0;
  let hasHeader = false;

  for await (const line of rl) {
    lineNumber++;

    if (!hasHeader) {
      const headers = parseCSVLine(line);
      emailColumnIndex = headers.findIndex(
        (h) => h.toLowerCase() === "email"
      );
      if (emailColumnIndex === -1) {
        console.error("Error: CSV must contain an 'email' column");
        process.exit(1);
      }
      hasHeader = true;
      continue;
    }

    rowsProcessed++;
    const fields = parseCSVLine(line);
    const email = fields[emailColumnIndex] || "";

    const result = validateEmail(email);
    if (!result.valid) {
      console.log(
        `Line ${lineNumber}: "${email}" - ${result.reason}`
      );
      invalidCount++;
    } else {
      validCount++;
    }
  }

  if (rowsProcessed === 0) {
    console.error("Error: CSV contains no data rows");
    process.exit(1);
  }

  console.log(`\nSummary: ${rowsProcessed} rows, ${validCount} valid, ${invalidCount} invalid`);

  process.exit(invalidCount > 0 ? 1 : 0);
}

main();
