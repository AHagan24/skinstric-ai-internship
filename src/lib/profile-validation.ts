const profileValuePattern = /^[\p{L}]+(?:[ '-][\p{L}]+)*$/u;

export function normalizeProfileValue(value: string) {
  return value.trim();
}

export function isValidProfileValue(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = normalizeProfileValue(value);

  return (
    normalizedValue.length > 0 &&
    normalizedValue.length <= 80 &&
    profileValuePattern.test(normalizedValue)
  );
}
