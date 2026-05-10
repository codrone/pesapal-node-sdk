export function isValidEmailAddress(email: string): boolean {
  if (email.length > 254) return false;

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@")) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (
    localPart.length > 64 ||
    domain.length < 3 ||
    domain.length > 253 ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.includes("..")
  ) {
    return false;
  }

  const dotIndex = domain.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === domain.length - 1) return false;

  return !hasWhitespace(localPart) && !hasWhitespace(domain);
}

function hasWhitespace(value: string): boolean {
  for (const char of value) {
    if (char === " " || char === "\t" || char === "\r" || char === "\n") {
      return true;
    }
  }

  return false;
}
