import re

ACCEPTED_EXAMPLES = ["+91 98765 43210", "(555) 123-4567", "555-123-4567", "5551234567", "+1 555 123 4567"]
REJECTED_EXAMPLES = ["", "12345", "555-CALL-NOW", "++1 555 123 4567", "555 123 45678901234", "  "]

_FORMAT_RE = re.compile(r"^\+?[\d\s().-]+$", re.ASCII)


def validate_phone(input: str) -> bool:
    if not isinstance(input, str):
        return False
    trimmed = input.strip()
    if not _FORMAT_RE.match(trimmed):
        return False
    digits = re.sub(r"\D", "", trimmed, flags=re.ASCII)
    return 10 <= len(digits) <= 15
