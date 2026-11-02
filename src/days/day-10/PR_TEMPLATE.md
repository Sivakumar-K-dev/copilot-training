# Capstone PR: CSV Email Validator and Password Strength Checker

Pair: Sivakumar K (Dev) + <QA partner name> (QA)  
Branch: capstone/sivakumar-day10 (does not need to merge to main)

## What it does

This capstone implements two dependency-free JavaScript features: a command-line CSV email validator and a password-strength checker.

The CSV validator reads a CSV file, reports every invalid email with its physical line number and reason, prints summary counts, and sets the correct process exit code. The password checker returns a score, strength label, and every failed password rule without logging or returning the supplied password.

## Requirements

### Option A: CSV Email Validator

- [x] Reads the CSV filename from the command-line argument
- [x] Reads a CSV containing a header row with an `email` column
- [x] Validates every email value in the CSV
- [x] Reports every invalid row with the physical line number, email value, and reason
- [x] Detects empty email values
- [x] Detects email values containing whitespace
- [x] Detects email values without text before `@`
- [x] Detects email values without a domain after `@`
- [x] Detects email domains without a dot
- [x] Prints total, valid, and invalid row counts
- [x] Returns exit code `1` when one or more rows are invalid
- [x] Returns exit code `0` when all rows are valid
- [x] Handles a missing filename with a clear error
- [x] Handles a nonexistent file with a clear error
- [x] Handles a missing `email` column with a clear error
- [x] Handles a CSV containing only a header
- [x] Uses only Node.js built-in modules
- [x] Uses no external dependencies

### Option B: Password Strength Checker

- [x] Implements `checkPassword(password)`
- [x] Returns `{ score, label, problems }`
- [x] Keeps the score between `0` and `4`
- [x] Uses only `weak`, `fair`, `good`, or `strong` as the label
- [x] Reports passwords shorter than 12 characters
- [x] Reports passwords without uppercase letters
- [x] Reports passwords without lowercase letters
- [x] Reports passwords without digits
- [x] Reports passwords without symbols
- [x] Detects common passwords case-insensitively
- [x] Reports every applicable failed rule instead of stopping after the first failure
- [x] Handles empty and non-string inputs without crashing
- [x] Does not log the supplied password
- [x] Does not return the supplied password
- [x] Uses no external dependencies

## Agreed Assumptions

The original requirements did not define every implementation detail. The following assumptions were agreed upon and tested.

### CSV Email Validator

- CSV line numbers refer to physical file lines, including the header row.
- The first data row is therefore line 2.
- Empty email values are invalid.
- Email values containing whitespace are invalid.
- An email must contain text before `@`.
- An email must contain a domain after `@`.
- The email domain must contain at least one dot.
- A CSV containing only a header is treated as an error because it contains no data rows.
- The `email` column does not need to be the first column.

### Password Strength Checker

- The score starts at `4`.
- One point is deducted for each failed password rule, excluding the common-password override.
- The final score is restricted to the range `0–4`.
- A common password always receives score `0`.
- Scores `0–1` are labelled `weak`.
- Score `2` is labelled `fair`.
- Score `3` is labelled `good`.
- Score `4` is labelled `strong`.
- Common-password matching is case-insensitive.
- The common-password list includes `password`, `password123`, `123456`, `12345678`, `qwerty`, `letmein`, `admin`, and `welcome`.

## Test Evidence

### Manual CSV Validation

The CSV validator was run using:

```powershell
node .\src\days\day-10\capstone\validate-csv.js .\src\days\day-10\capstone\sample.csv