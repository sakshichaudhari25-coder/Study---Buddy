export function isRequestBody(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return (
    typeof email === "string" &&
    email.trim().length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

export function isValidPassword(password, minimumLength = 6) {
  return (
    typeof password === "string" &&
    password.length >= minimumLength &&
    Buffer.byteLength(password, "utf8") <= 72
  );
}

export function isValidDueDate(value) {
  if (typeof value !== "string") return false;

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    return isValidDatePart(value);
  }

  const datePart = value.split("T")[0];
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value
    ) ||
    !isValidDatePart(datePart)
  ) {
    return false;
  }

  return Number.isFinite(Date.parse(value));
}

function isValidDatePart(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}
